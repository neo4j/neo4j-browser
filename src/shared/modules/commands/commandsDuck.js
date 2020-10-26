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
  extractAllowlistFromConfigString,
  addProtocolsToUrlList,
  firstSuccessPromise,
  serialExecution,
  resolveAllowlistWildcard
} from 'services/utils'
import helper from 'services/commandInterpreterHelper'
import { addHistory } from '../history/historyDuck'
import {
  getMaxHistory,
  getPlayImplicitInitCommands,
  shouldEnableMultiStatementMode
} from '../settings/settingsDuck'
import { fetchRemoteGuide } from './helpers/play'
import { CONNECTION_SUCCESS } from '../connections/connectionsDuck'
import {
  UPDATE_SETTINGS,
  getAvailableSettings,
  getRemoteContentHostnameAllowlist,
  getDefaultRemoteContentHostnameAllowlist
} from '../dbMeta/dbMetaDuck'
import { APP_START, USER_CLEAR } from 'shared/modules/app/appDuck'
import { add as addFrame } from 'shared/modules/stream/streamDuck'
import { update as updateQueryResult } from 'shared/modules/requests/requestsDuck'

export const NAME = 'commands'
export const SINGLE_COMMAND_QUEUED = `${NAME}/SINGLE_COMMAND_QUEUED`
export const COMMAND_QUEUED = `${NAME}/COMMAND_QUEUED`
export const SYSTEM_COMMAND_QUEUED = `${NAME}/SYSTEM_COMMAND_QUEUED`
export const UNKNOWN_COMMAND = `${NAME}/UNKNOWN_COMMAND`
export const SHOW_ERROR_MESSAGE = `${NAME}/SHOW_ERROR_MESSAGE`
export const CLEAR_ERROR_MESSAGE = `${NAME}/CLEAR_ERROR_MESSAGE`
export const CYPHER = `${NAME}/CYPHER`
export const CYPHER_SUCCEEDED = `${NAME}/CYPHER_SUCCEEDED`
export const CYPHER_FAILED = `${NAME}/CYPHER_FAILED`
export const FETCH_GUIDE_FROM_ALLOWLIST = `${NAME}FETCH_GUIDE_FROM_ALLOWLIST`

export const useDbCommand = 'use'
export const listDbsCommand = 'dbs'
export const autoCommitTxCommand = 'auto'

const initialState = {}
export const getErrorMessage = state => state[NAME].errorMessage
export const allowlistedMultiCommands = () => [':param', ':use']

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case APP_START:
      return { ...initialState, ...state }
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
  { id, requestId, parentId, useDb, isRerun = false } = {}
) => {
  return {
    type: COMMAND_QUEUED,
    cmd,
    id,
    requestId,
    parentId,
    useDb,
    isRerun
  }
}

export const executeSingleCommand = (
  cmd,
  { id, requestId, useDb, isRerun = false } = {}
) => {
  return {
    type: SINGLE_COMMAND_QUEUED,
    cmd,
    id,
    requestId,
    useDb,
    isRerun
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
  errorMessage
})
export const clearErrorMessage = () => ({
  type: CLEAR_ERROR_MESSAGE
})

export const cypher = query => ({ type: CYPHER, query })
export const successfulCypher = query => ({ type: CYPHER_SUCCEEDED, query })
export const unsuccessfulCypher = query => ({ type: CYPHER_FAILED, query })
export const fetchGuideFromAllowlistAction = url => ({
  type: FETCH_GUIDE_FROM_ALLOWLIST,
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

      // Semicolons in :style grass break parsing of multiline statements from codemirror.
      const useMultiStatement =
        !action.cmd.startsWith(':style') &&
        shouldEnableMultiStatementMode(store.getState())

      const statements = useMultiStatement
        ? extractStatementsFromString(action.cmd)
        : [action.cmd]

      if (!statements.length || !statements[0]) {
        return
      }
      if (statements.length === 1) {
        // Single command
        return store.dispatch(executeSingleCommand(action.cmd, action))
      }
      const parentId = action.parentId || v4()
      store.dispatch(
        addFrame({ type: 'cypher-script', id: parentId, cmd: action.cmd })
      )
      const jobs = statements.map(cmd => {
        const cleanCmd = cleanCommand(cmd)
        const requestId = v4()
        const cmdId = v4()
        const allowlistedCommands = allowlistedMultiCommands()
        const isAllowlisted = allowlistedCommands.some(wcmd =>
          cleanCmd.startsWith(wcmd)
        )

        // Ignore client commands that aren't allowlisted
        const ignore = cleanCmd.startsWith(':') && !isAllowlisted

        const { action, interpreted } = buildCommandObject(
          { cmd: cleanCmd, ignore },
          helper.interpret
        )
        action.requestId = requestId
        action.parentId = parentId
        action.id = cmdId
        store.dispatch(
          addFrame({ ...action, requestId, type: interpreted.name })
        )
        store.dispatch(updateQueryResult(requestId, null, 'waiting'))
        return {
          workFn: () => interpreted.exec(action, store.dispatch, store),
          onStart: () => {},
          onSkip: () =>
            store.dispatch(updateQueryResult(requestId, null, 'skipped'))
        }
      })

      serialExecution(...jobs).catch(() => {})
    })
    .mapTo({ type: 'NOOP' })

export const handleSingleCommandEpic = (action$, store) =>
  action$
    .ofType(SINGLE_COMMAND_QUEUED)
    .merge(action$.ofType(SYSTEM_COMMAND_QUEUED))
    .map(action => buildCommandObject(action, helper.interpret))
    .mergeMap(({ action, interpreted }) => {
      return new Promise((resolve, reject) => {
        const noop = { type: 'NOOP' }
        if (!(action.cmd || '').trim().length) {
          resolve(noop)
          return
        }
        if (interpreted.name !== 'cypher') {
          action.cmd = cleanCommand(action.cmd)
        }
        action.ts = new Date().getTime()
        const res = interpreted.exec(action, store.dispatch, store)
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
          const cmds = extractPostConnectCommandsFromServerConfig(
            serverSettings['browser.post_connect_cmd']
          )
          const playImplicitInitCommands = getPlayImplicitInitCommands(
            store.getState()
          )
          if (playImplicitInitCommands && cmds !== undefined) {
            cmds.forEach(cmd => {
              store.dispatch(executeSystemCommand(`:${cmd}`))
            })
          }
        }
        return { type: 'NOOP' }
      })
      .take(1)
  )

export const fetchGuideFromAllowlistEpic = (some$, store) =>
  some$.ofType(FETCH_GUIDE_FROM_ALLOWLIST).mergeMap(action => {
    if (!action.$$responseChannel || !action.url) {
      return Rx.Observable.of({ type: 'NOOP' })
    }
    const allowlistStr = getRemoteContentHostnameAllowlist(store.getState())
    const allowlist = extractAllowlistFromConfigString(allowlistStr)
    const defaultAllowlist = extractAllowlistFromConfigString(
      getDefaultRemoteContentHostnameAllowlist(store.getState())
    )
    const resolvedWildcardAllowlist = resolveAllowlistWildcard(
      allowlist,
      defaultAllowlist
    )
    const urlAllowlist = addProtocolsToUrlList(resolvedWildcardAllowlist)
    const guidesUrls = urlAllowlist.map(url => `${url}/${action.url}`)

    return firstSuccessPromise(guidesUrls, url => {
      // Get first successful fetch
      return fetchRemoteGuide(url, allowlistStr).then(r => ({
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
