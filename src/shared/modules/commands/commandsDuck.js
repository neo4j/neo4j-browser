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

import bolt from 'services/bolt/bolt'
import { getInterpreter, isNamedInterpreter } from 'services/commandUtils'
import { hydrate } from 'services/duckUtils'
import helper from 'services/commandInterpreterHelper'
import { addHistory } from '../history/historyDuck'
import { getCmdChar } from '../settings/settingsDuck'
import { CONNECTION_SUCCESS } from '../connections/connectionsDuck'
import { USER_CLEAR } from 'shared/modules/app/appDuck'
import { fetchMetaData } from '../dbMeta/dbMetaDuck'

export const NAME = 'commands'
export const USER_COMMAND_QUEUED = NAME + '/USER_COMMAND_QUEUED'
export const SYSTEM_COMMAND_QUEUED = NAME + '/SYSTEM_COMMAND_QUEUED'
export const UNKNOWN_COMMAND = NAME + '/UNKNOWN_COMMAND'
export const KNOWN_COMMAND = NAME + '/KNOWN_COMMAND'
export const SHOW_ERROR_MESSAGE = NAME + '/SHOW_ERROR_MESSAGE'

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
        store.dispatch(addHistory({cmd: action.cmd})) // Only save valid commands to history
        store.dispatch({ type: KNOWN_COMMAND }) // Clear any eventual unknown command notifications
      }
    })
    .mergeMap(({action, interpreted, cmdchar}) => {
      return new Promise((resolve, reject) => {
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
  some$.ofType(CONNECTION_SUCCESS)
    .mergeMap(() => {
      return bolt.directTransaction('CALL dbms.queryJmx("org.neo4j:*")')
        .then((res) => {
          // Find kernel conf
          let conf
          res.records.forEach((record) => {
            if (record.get('name').match(/Configuration$/)) conf = record.get('attributes')
          })
          if (conf && conf['browser.post_connect_cmd'] && conf['browser.post_connect_cmd'].value) {
            const cmdchar = getCmdChar(store.getState())
            store.dispatch(executeSystemCommand(`${cmdchar}${conf['browser.post_connect_cmd'].value}`))
          }
          return null
        }).catch((e) => {
          return null
        })
    })
    .mapTo({ type: 'NOOP' })
