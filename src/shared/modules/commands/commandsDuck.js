/*
 * Copyright (c) 2002-2016 "Neo Technology,"
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
import { cleanCommand } from 'services/commandUtils'
import helper from 'services/commandInterpreterHelper'
import { addHistory } from '../history/historyDuck'
import { getSettings } from '../settings/settingsDuck'
import { CONNECTION_SUCCESS } from '../connections/connectionsDuck'

const NAME = 'commands'
export const USER_COMMAND_QUEUED = NAME + '/USER_COMMAND_QUEUED'
export const SYSTEM_COMMAND_QUEUED = NAME + '/SYSTEM_COMMAND_QUEUED'

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

// Epics
export const handleCommandsEpic = (action$, store) =>
  action$.ofType(USER_COMMAND_QUEUED)
    .do((action) => store.dispatch(addHistory({cmd: action.cmd})))
    .merge(action$.ofType(SYSTEM_COMMAND_QUEUED))
    .mergeMap((action) => {
      const cleanCmd = cleanCommand(action.cmd)
      const settingsState = getSettings(store.getState())
      let interpreted = helper.interpret('cypher')// assume cypher
      if (cleanCmd[0] === settingsState.cmdchar) { // :command
        interpreted = helper.interpret(action.cmd.substr(settingsState.cmdchar.length))
      }
      return new Promise((resolve, reject) => {
        const res = interpreted.exec(action, settingsState.cmdchar, store.dispatch, store)
        const noop = { type: 'NOOP' }
        if (!res || !res.then) {
          resolve(noop)
        } else {
          res
            .then((r) => resolve(noop))
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
            const cmdchar = getSettings(store.getState()).cmdchar
            store.dispatch(executeSystemCommand(`${cmdchar}${conf['browser.post_connect_cmd'].value}`))
          }
          return null
        }).catch((e) => {
          return null
        })
    })
    .mapTo({ type: 'NOOP' })
