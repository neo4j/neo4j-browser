/*
 * Copyright (c) 2002-2017 "Neo Technology,"
 * Network Engine for Objects in Lund AB [http://neotechnology.com]
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

import { getInterpreter, isNamedInterpreter, cleanCommand } from 'services/commandUtils'
import { hydrate } from 'services/duckUtils'
import helper from 'services/commandInterpreterHelper'
import { addHistory } from '../history/historyDuck'
import { getCmdChar, getMaxHistory } from '../settings/settingsDuck'
import { CONNECTION_SUCCESS } from '../connections/connectionsDuck'
import { UPDATE_SETTINGS, getAvailableSettings, fetchMetaData } from '../dbMeta/dbMetaDuck'
import { USER_CLEAR } from 'shared/modules/app/appDuck'

export const NAME = 'commands'
export const USER_COMMAND_QUEUED = NAME + '/USER_COMMAND_QUEUED'
export const SYSTEM_COMMAND_QUEUED = NAME + '/SYSTEM_COMMAND_QUEUED'
export const UNKNOWN_COMMAND = NAME + '/UNKNOWN_COMMAND'
export const KNOWN_COMMAND = NAME + '/KNOWN_COMMAND'
export const SHOW_ERROR_MESSAGE = NAME + '/SHOW_ERROR_MESSAGE'
export const CYPHER = NAME + '/CYPHER'
export const CYPHER_SUCCEEDED = NAME + '/CYPHER_SUCCEEDED'
export const CYPHER_FAILED = NAME + '/CYPHER_FAILED'

const initialState = {
  lastCommandWasUnknown: false
}
export const wasUnknownCommand = (state) => state[NAME].lastCommandWasUnknown || initialState.lastCommandWasUnknown
export const getErrorMessage = (state) => state[NAME].errorMessage

export default function reducer (state = initialState, action) {
  state = hydrate(initialState, state)

  switch (action.type) {
    case UNKNOWN_COMMAND:
      return { lastCommandWasUnknown: true }
    case KNOWN_COMMAND:
      return { lastCommandWasUnknown: false }
    case SHOW_ERROR_MESSAGE:
      return { lastCommandWasUnknown: false, errorMessage: action.errorMessage }
    case USER_CLEAR:
      return initialState
    default:
      return state
  }
}

// Action creators
export const executeCommand = (cmd, contextId, requestId = null) => {
  return {
    type: USER_COMMAND_QUEUED,
    cmd,
    id: contextId,
    requestId
  }
}

export const executeSystemCommand = (cmd, contextId, requestId = null) => {
  return {
    type: SYSTEM_COMMAND_QUEUED,
    cmd,
    id: contextId,
    requestId
  }
}

export const unknownCommand = (cmd) => ({
  type: UNKNOWN_COMMAND,
  cmd
})

export const showErrorMessage = (errorMessage) => ({
  type: SHOW_ERROR_MESSAGE,
  errorMessage: errorMessage
})
export const cypher = (query) => ({ type: CYPHER, query })
export const successfulCypher = (query) => ({ type: CYPHER_SUCCEEDED, query })
export const unsuccessfulCypher = (query) => ({ type: CYPHER_FAILED, query })

// Epics
export const handleCommandsEpic = (action$, store) =>
  action$.ofType(USER_COMMAND_QUEUED)
    .merge(action$.ofType(SYSTEM_COMMAND_QUEUED))
    .map((action) => {
      const cmdchar = getCmdChar(store.getState())
      const interpreted = getInterpreter(helper.interpret, action.cmd, cmdchar)
      return {action, interpreted, cmdchar}
    })
    .do(({action, interpreted}) => {
      if (action.type === SYSTEM_COMMAND_QUEUED) return
      if (isNamedInterpreter(interpreted)) {
        const maxHistory = getMaxHistory(store.getState())
        store.dispatch(addHistory(action.cmd, maxHistory)) // Only save valid commands to history
        store.dispatch({ type: KNOWN_COMMAND }) // Clear any eventual unknown command notifications
      }
    })
    .mergeMap(({action, interpreted, cmdchar}) => {
      return new Promise((resolve, reject) => {
        if (interpreted.name !== 'cypher') action.cmd = cleanCommand(action.cmd)
        const res = interpreted.exec(action, cmdchar, store.dispatch, store)
        const noop = { type: 'NOOP' }
        if (!res || !res.then) {
          resolve(noop)
        } else {
          res
            .then((r) => {
              store.dispatch(fetchMetaData())
              resolve(noop)
            })
            .catch((e) => resolve(noop))
        }
      })
    })

export const postConnectCmdEpic = (some$, store) =>
  some$
    .zip(some$.ofType(CONNECTION_SUCCESS), some$.ofType(UPDATE_SETTINGS))
    .do(() => {
      const serverSettings = getAvailableSettings(store.getState())
      if (serverSettings && serverSettings['browser.post_connect_cmd']) {
        const cmdchar = getCmdChar(store.getState())
        store.dispatch(executeSystemCommand(`${cmdchar}${serverSettings['browser.post_connect_cmd']}`))
      }
    })
    .mapTo({ type: 'NOOP' })
