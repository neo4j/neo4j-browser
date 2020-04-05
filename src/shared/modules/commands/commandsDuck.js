/*
 * Copyright (c) 2002-2020 "Neo4j,"
 * Neo4j Sweden AB [http://neo4j.com]
 *
 * This file is part of Neo4j.
 *
 * Neo4j is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import Rx from 'rxjs'
import { v4 } from 'uuid'
import {
  cleanCommand,
  extractPostConnectCommandsFromServerConfig,
  buildCommandObject,
  extractStatementsFromString
} from 'services/commandUtils'
import {
  extractWhitelistFromConfigString,
  addProtocolsToUrlList,
  firstSuccessPromise,
  serialExecution,
  resolveWhitelistWildcard
} from 'services/utils'
import helper from 'services/commandInterpreterHelper'
import { addHistory } from '../history/historyDuck'
import {
  getCmdChar,
  getMaxHistory,
  getPlayImplicitInitCommands,
  shouldEnableMultiStatementMode
} from '../settings/settingsDuck'
import { fetchRemoteGuide } from './helpers/play'
import { CONNECTION_SUCCESS } from '../connections/connectionsDuck'
import {
  UPDATE_SETTINGS,
  getAvailableSettings,
  getRemoteContentHostnameWhitelist,
  getDefaultRemoteContentHostnameWhitelist
} from '../dbMeta/dbMetaDuck'
import { APP_START, USER_CLEAR } from 'shared/modules/app/appDuck'
import { add as addFrame } from 'shared/modules/stream/streamDuck'
import { update as updateQueryResult } from 'shared/modules/requests/requestsDuck'

export const NAME = 'commands'
export const SINGLE_COMMAND_QUEUED = NAME + '/SINGLE_COMMAND_QUEUED'
export const COMMAND_QUEUED = NAME + '/COMMAND_QUEUED'
export const SYSTEM_COMMAND_QUEUED = NAME + '/SYSTEM_COMMAND_QUEUED'
export const UNKNOWN_COMMAND = NAME + '/UNKNOWN_COMMAND'
export const SHOW_ERROR_MESSAGE = NAME + '/SHOW_ERROR_MESSAGE'
export const CLEAR_ERROR_MESSAGE = NAME + '/CLEAR_ERROR_MESSAGE'
export const CYPHER = NAME + '/CYPHER'
export const CYPHER_SUCCEEDED = NAME + '/CYPHER_SUCCEEDED'
export const CYPHER_FAILED = NAME + '/CYPHER_FAILED'
export const FETCH_GUIDE_FROM_WHITELIST = NAME + 'FETCH_GUIDE_FROM_WHITELIST'

export const useDbCommand = 'use'
export const listDbsCommand = 'dbs'
export const autoCommitTxCommand = 'auto'

const initialState = {}
export const getErrorMessage = state => state[NAME].errorMessage
export const whitelistedMultiCommands = () => [':param', ':use']

export default function reducer(state = initialState, action) {
  if (action.type === APP_START) {
    state = { ...initialState, ...state }
  }

  switch (action.type) {
    case SHOW_ERROR_MESSAGE:
      return { errorMessage: action.errorMessage }
    case CLEAR_ERROR_MESSAGE:
      return {}
    case USER_CLEAR:
      return initialState
    default:
      return state
  }
}

// Action creators

export const executeCommand = (
  cmd,
  { id, requestId, parentId, useDb } = {}
) => {
  return {
    type: COMMAND_QUEUED,
    cmd,
    id,
    requestId,
    parentId,
    useDb
  }
}

export const executeSingleCommand = (cmd, { id, requestId, useDb } = {}) => {
  return {
    type: SINGLE_COMMAND_QUEUED,
    cmd,
    id,
    requestId,
    useDb
  }
}

export const executeSystemCommand = cmd => {
  return {
    type: SYSTEM_COMMAND_QUEUED,
    cmd
  }
}

export const unknownCommand = cmd => ({
  type: UNKNOWN_COMMAND,
  cmd
})

export const showErrorMessage = errorMessage => ({
  type: SHOW_ERROR_MESSAGE,
  errorMessage: errorMessage
})
export const clearErrorMessage = () => ({
  type: CLEAR_ERROR_MESSAGE
})

export const cypher = query => ({ type: CYPHER, query })
export const successfulCypher = query => ({ type: CYPHER_SUCCEEDED, query })
export const unsuccessfulCypher = query => ({ type: CYPHER_FAILED, query })
export const fetchGuideFromWhitelistAction = url => ({
  type: FETCH_GUIDE_FROM_WHITELIST,
  url
})

// Epics

export const handleCommandEpic = (action$, store) =>
  action$
    .ofType(COMMAND_QUEUED)
    .do(action => {
      // Map some commands to the help command
      if (['?', 'help', ':'].includes(action.cmd)) {
        action.cmd = ':help'
      }

      store.dispatch(clearErrorMessage())
      const maxHistory = getMaxHistory(store.getState())
      store.dispatch(addHistory(action.cmd, maxHistory))
      const statements = shouldEnableMultiStatementMode(store.getState())
        ? extractStatementsFromString(action.cmd)
        : [action.cmd]

      if (!statements.length || !statements[0]) {
        return
      }
      if (statements.length === 1) {
        // Single command
        return store.dispatch(
          executeSingleCommand(statements[0], {
            id: action.id,
            requestId: action.requestId,
            useDb: action.useDb
          })
        )
      }
      const parentId = action.parentId || v4()
      store.dispatch(
        addFrame({ type: 'cypher-script', id: parentId, cmd: action.cmd })
      )
      const cmdchar = getCmdChar(store.getState())
      const jobs = []
      statements.forEach(cmd => {
        cmd = cleanCommand(cmd)
        const requestId = v4()
        const cmdId = v4()
        const whitelistedCommands = whitelistedMultiCommands()
        const isWhitelisted =
          whitelistedCommands.filter(wcmd => !!cmd.startsWith(wcmd)).length > 0

        // Ignore client commands that aren't whitelisted
        const ignore = !!cmd.startsWith(cmdchar) && !isWhitelisted

        const { action, interpreted } = buildCommandObject(
          { cmd, ignore },
          helper.interpret,
          getCmdChar(store.getState())
        )
        action.requestId = requestId
        action.parentId = parentId
        action.id = cmdId
        store.dispatch(
          addFrame({ ...action, requestId, type: interpreted.name })
        )
        store.dispatch(updateQueryResult(requestId, null, 'waiting'))
        jobs.push({
          workFn: () =>
            interpreted.exec(action, cmdchar, store.dispatch, store),
          onStart: () => {},
          onSkip: () =>
            store.dispatch(updateQueryResult(requestId, null, 'skipped'))
        })
      })

      serialExecution(...jobs).catch(() => {})
    })
    .mapTo({ type: 'NOOP' })

export const handleSingleCommandEpic = (action$, store) =>
  action$
    .ofType(SINGLE_COMMAND_QUEUED)
    .merge(action$.ofType(SYSTEM_COMMAND_QUEUED))
    .map(action =>
      buildCommandObject(action, helper.interpret, getCmdChar(store.getState()))
    )
    .mergeMap(({ action, interpreted, cmdchar }) => {
      return new Promise((resolve, reject) => {
        const noop = { type: 'NOOP' }
        if (!(action.cmd || '').trim().length) {
          resolve(noop)
          return
        }
        if (interpreted.name !== 'cypher') {
          action.cmd = cleanCommand(action.cmd)
        }
        const res = interpreted.exec(action, cmdchar, store.dispatch, store)
        if (!res || !res.then) {
          resolve(noop)
        } else {
          res
            .then(r => {
              resolve(noop)
            })
            .catch(e => resolve(noop))
        }
      })
    })

export const postConnectCmdEpic = (some$, store) =>
  some$.ofType(CONNECTION_SUCCESS).mergeMap(() =>
    some$
      .ofType(UPDATE_SETTINGS)
      .map(() => {
        const serverSettings = getAvailableSettings(store.getState())
        if (serverSettings && serverSettings['browser.post_connect_cmd']) {
          const cmdchar = getCmdChar(store.getState())
          const cmds = extractPostConnectCommandsFromServerConfig(
            serverSettings['browser.post_connect_cmd']
          )
          const playImplicitInitCommands = getPlayImplicitInitCommands(
            store.getState()
          )
          if (playImplicitInitCommands && cmds !== undefined) {
            cmds.forEach(cmd => {
              store.dispatch(executeSystemCommand(`${cmdchar}${cmd}`))
            })
          }
        }
        return { type: 'NOOP' }
      })
      .take(1)
  )

export const fetchGuideFromWhitelistEpic = (some$, store) =>
  some$.ofType(FETCH_GUIDE_FROM_WHITELIST).mergeMap(action => {
    if (!action.$$responseChannel || !action.url) {
      return Rx.Observable.of({ type: 'NOOP' })
    }
    const whitelistStr = getRemoteContentHostnameWhitelist(store.getState())
    const whitelist = extractWhitelistFromConfigString(whitelistStr)
    const defaultWhitelist = extractWhitelistFromConfigString(
      getDefaultRemoteContentHostnameWhitelist(store.getState())
    )
    const resolvedWildcardWhitelist = resolveWhitelistWildcard(
      whitelist,
      defaultWhitelist
    )
    const urlWhitelist = addProtocolsToUrlList(resolvedWildcardWhitelist)
    const guidesUrls = urlWhitelist.map(url => url + '/' + action.url)

    return firstSuccessPromise(guidesUrls, url => {
      // Get first successful fetch
      return fetchRemoteGuide(url, whitelistStr).then(r => ({
        type: action.$$responseChannel,
        success: true,
        result: r
      }))
    }).catch(e => ({
      type: action.$$responseChannel,
      success: false,
      error: e
    })) // If all fails, report that
  })
