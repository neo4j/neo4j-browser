/*
 * Copyright (c) "Neo4j"
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

import { CONNECTION_SUCCESS } from '../connections/connectionsDuck'
import {
  getAvailableSettings,
  getDefaultRemoteContentHostnameAllowlist,
  getRemoteContentHostnameAllowlist,
  UPDATE_SETTINGS
} from '../dbMeta/dbMetaDuck'
import { addHistory } from '../history/historyDuck'
import {
  getMaxHistory,
  getPlayImplicitInitCommands,
  shouldEnableMultiStatementMode
} from '../settings/settingsDuck'
import { fetchRemoteGuideAsync } from './helpers/playAndGuides'
import helper from 'services/commandInterpreterHelper'
import {
  buildCommandObject,
  cleanCommand,
  extractPostConnectCommandsFromServerConfig,
  extractStatementsFromString
} from 'services/commandUtils'
import {
  addProtocolsToUrlList,
  extractAllowlistFromConfigString,
  firstSuccessPromise,
  resolveAllowlistWildcard,
  serialExecution
} from 'services/utils'
import { APP_START, USER_CLEAR } from 'shared/modules/app/appDuck'
import { add as addFrame } from 'shared/modules/frames/framesDuck'
import { update as updateQueryResult } from 'shared/modules/requests/requestsDuck'

export const NAME = 'commands'
export const SINGLE_COMMAND_QUEUED = `${NAME}/SINGLE_COMMAND_QUEUED`
export const COMMAND_QUEUED = `${NAME}/COMMAND_QUEUED`
export const SYSTEM_COMMAND_QUEUED = `${NAME}/SYSTEM_COMMAND_QUEUED`
export const UNKNOWN_COMMAND = `${NAME}/UNKNOWN_COMMAND`
export const SHOW_ERROR_MESSAGE = `${NAME}/SHOW_ERROR_MESSAGE`
export const CLEAR_ERROR_MESSAGE = `${NAME}/CLEAR_ERROR_MESSAGE`
export const FETCH_GUIDE_FROM_ALLOWLIST = `${NAME}FETCH_GUIDE_FROM_ALLOWLIST`
export const CYPHER_SUCCEEDED = `cypher/CYPHER_SUCCEEDED`
export const CYPHER_FAILED = `cypher/CYPHER_FAILED`

export const useDbCommand = 'use'
export const listDbsCommand = 'dbs'
export const autoCommitTxCommand = 'auto'

const initialState = {}
export const getErrorMessage = (state: any) => state[NAME].errorMessage
export const allowlistedMultiCommands = () => [':param', ':use', ':auto']

export default function reducer(state = initialState, action: any) {
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

export interface ExecuteSingleCommandAction {
  type: typeof SINGLE_COMMAND_QUEUED
  cmd: string
  id?: number | string
  requestId?: string
  useDb?: string | null
  isRerun?: boolean
}

export interface ExecuteCommandAction extends ExecuteSingleCommandAction {
  type: typeof COMMAND_QUEUED
  parentId?: string
  source?: string
}

export const commandSources = {
  button: 'BUTTON',
  playButton: 'PLAY-BUTTON',
  auto: 'AUTOMATIC',
  editor: 'EDITOR',
  rerunFrame: 'RERUN',
  favorite: 'FAVORITE',
  projectFile: 'PROJECT-FILE',
  sidebar: 'SIDEBAR',
  url: 'URL'
}

export const executeSingleCommand = (
  cmd: string,
  {
    id,
    requestId,
    useDb,
    isRerun = false
  }: {
    id?: number | string
    requestId?: string
    useDb?: string | null
    isRerun?: boolean
  } = {}
): ExecuteSingleCommandAction => {
  return {
    type: SINGLE_COMMAND_QUEUED,
    cmd,
    id,
    requestId,
    useDb,
    isRerun
  }
}

export const executeCommand = (
  cmd: string,
  {
    id = undefined,
    requestId = undefined,
    parentId = undefined,
    useDb = undefined,
    isRerun = false,
    source = undefined
  }: {
    id?: number | string
    requestId?: string
    parentId?: string
    useDb?: string | null
    isRerun?: boolean
    source?: string
  } = {}
): ExecuteCommandAction => {
  return {
    type: COMMAND_QUEUED,
    cmd,
    id,
    requestId,
    parentId,
    useDb,
    isRerun,
    source
  }
}

export const executeSystemCommand = (cmd: any) => {
  return {
    type: SYSTEM_COMMAND_QUEUED,
    cmd
  }
}

export const unknownCommand = (cmd: any) => ({
  type: UNKNOWN_COMMAND,
  cmd
})

export const showErrorMessage = (errorMessage: any) => ({
  type: SHOW_ERROR_MESSAGE,
  errorMessage
})
export const clearErrorMessage = () => ({
  type: CLEAR_ERROR_MESSAGE
})

export const successfulCypher = (query: any) => ({
  type: CYPHER_SUCCEEDED,
  query
})
export const unsuccessfulCypher = (query: any) => ({
  type: CYPHER_FAILED,
  query
})
export const fetchGuideFromAllowlistAction = (url: any) => ({
  type: FETCH_GUIDE_FROM_ALLOWLIST,
  url
})

// Epics

export const handleCommandEpic = (action$: any, store: any) =>
  action$
    .ofType(COMMAND_QUEUED)
    .do((action: any) => {
      // Map some commands to the help command
      if (['?', 'help', ':'].includes(action.cmd)) {
        action.cmd = ':help'
      }

      store.dispatch(clearErrorMessage())
      const maxHistory = getMaxHistory(store.getState())
      store.dispatch(addHistory(action.cmd, maxHistory))

      const { cmd } = action

      // extractStatementsFromString is _very_ slow. So we check if we can
      // skip it. If there are no semi colons apart from the final character
      // it can't be a multistatement and we can bail out early
      const couldBeMultistatement =
        cmd.split(';').filter((a: string) => a.trim() !== '').length > 1

      // Semicolons in :style grass break parsing of multiline statements from codemirror.
      const useMultiStatement =
        couldBeMultistatement &&
        !cmd.startsWith(':style') &&
        shouldEnableMultiStatementMode(store.getState())

      const statements = useMultiStatement
        ? extractStatementsFromString(cmd)
        : [cmd]

      if (!statements.length || !statements[0]) {
        return
      }
      if (statements.length === 1) {
        // Single command
        return store.dispatch(executeSingleCommand(cmd, action))
      }
      const parentId = (action.isRerun ? action.id : action.parentId) || v4()
      store.dispatch(
        addFrame({
          type: 'cypher-script',
          id: parentId,
          cmd,
          isRerun: action.isRerun
        } as any)
      )
      const jobs = statements.map((cmd: any) => {
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
          onStart: () => {
            /* no op */
          },
          onSkip: () =>
            store.dispatch(updateQueryResult(requestId, null, 'skipped'))
        }
      })

      serialExecution(...jobs).catch(() => {})
    })
    .ignoreElements()

export const handleSingleCommandEpic = (action$: any, store: any) =>
  action$
    .ofType(SINGLE_COMMAND_QUEUED)
    .merge(action$.ofType(SYSTEM_COMMAND_QUEUED))
    .map((action: any) => buildCommandObject(action, helper.interpret))
    .mergeMap(({ action, interpreted }: any) => {
      return new Promise(resolve => {
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
            .then(() => {
              resolve(noop)
            })
            .catch(() => resolve(noop))
        }
      })
    })

export const postConnectCmdEpic = (some$: any, store: any) =>
  some$.ofType(CONNECTION_SUCCESS).mergeMap(() =>
    some$
      .ofType(UPDATE_SETTINGS)
      .map(() => {
        const serverSettings = getAvailableSettings(store.getState())
        if (serverSettings && serverSettings.postConnectCmd) {
          const cmds = extractPostConnectCommandsFromServerConfig(
            serverSettings.postConnectCmd
          )
          const playImplicitInitCommands = getPlayImplicitInitCommands(
            store.getState()
          )
          if (playImplicitInitCommands && cmds !== undefined) {
            cmds.forEach((cmd: any) => {
              store.dispatch(executeSystemCommand(`:${cmd}`))
            })
          }
        }
        return { type: 'NOOP' }
      })
      .take(1)
  )

export const fetchGuideFromAllowlistEpic = (some$: any, store: any) =>
  some$.ofType(FETCH_GUIDE_FROM_ALLOWLIST).mergeMap((action: any) => {
    if (!action.$$responseChannel || !action.url) {
      return Rx.Observable.of({ type: 'NOOP' })
    }
    const allowlistStr = getRemoteContentHostnameAllowlist(store.getState())
    const allowlist = extractAllowlistFromConfigString(allowlistStr)
    const defaultAllowlist = extractAllowlistFromConfigString(
      getDefaultRemoteContentHostnameAllowlist()
    )
    const resolvedWildcardAllowlist = resolveAllowlistWildcard(
      allowlist,
      defaultAllowlist
    )
    const urlAllowlist = addProtocolsToUrlList(resolvedWildcardAllowlist)
    const guidesUrls = urlAllowlist.map((url: any) => `${url}/${action.url}`)

    return firstSuccessPromise(guidesUrls, (url: any) => {
      // Get first successful fetch
      return fetchRemoteGuideAsync(url, allowlistStr).then(r => ({
        type: action.$$responseChannel,
        success: true,
        result: r
      }))
    }).catch((e: any) => ({
      type: action.$$responseChannel,
      success: false,
      error: e
    })) // If all fails, report that
  })
