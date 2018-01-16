/*
 * Copyright (c) 2002-2018 "Neo4j, Inc"
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

import { splitStringOnFirst, splitStringOnLast } from 'services/commandUtils'
import * as connections from 'shared/modules/connections/connectionsDuck'
import { add as addFrameAction } from 'shared/modules/stream/streamDuck'
import { CONNECTION_ID as DISCOVERY_CONNECTION_ID } from 'shared/modules/discovery/discoveryDuck'
import { shouldRetainConnectionCredentials } from 'shared/modules/dbMeta/dbMetaDuck'
import {
  UnknownCommandError,
  getErrorMessage,
  AddServerValidationError
} from 'services/exceptions'

export function handleServerCommand (action, cmdchar, put, store) {
  const [serverCmd, props] = splitStringOnFirst(
    splitStringOnFirst(action.cmd.substr(cmdchar.length), ' ')[1],
    ' '
  )
  if (serverCmd === 'list') {
    return handleServerListCommand(action, cmdchar, put, store)
  }
  if (serverCmd === 'connect') {
    return connectToConnection(action, props, put, store)
  }
  if (serverCmd === 'disconnect') {
    return handleDisconnectCommand(action, props, put, store)
  }
  if (serverCmd === 'add') {
    return handleServerAddCommand(action, cmdchar, put, store)
  }
  if (serverCmd === 'user') {
    return handleUserCommand(action, props, cmdchar)
  }
  if (serverCmd === 'change-password') {
    return handleChangePasswordCommand(action, props, cmdchar)
  }
  if (serverCmd === 'status') {
    return handleServerStatusCommand(action)
  }
  if (serverCmd === 'switch') {
    return handleServerSwitchCommand(action, props, store)
  }
  return {
    ...action,
    type: 'error',
    error: { message: getErrorMessage(UnknownCommandError(action.cmd)) }
  }
}

function handleDisconnectCommand (action, cmdchar, put, store) {
  put(addFrameAction({ ...action, type: 'disconnect' }))
  const activeConnection = connections.getActiveConnection(store.getState())
  const disconnectAction = connections.disconnectAction(activeConnection)
  put(disconnectAction)
  return null
}

function handleServerListCommand (action, cmdchar, put, store) {
  const state = connections.getConnections(store.getState())
  return { ...action, type: 'pre', result: JSON.stringify(state, null, 2) }
}

function handleUserCommand (action, props, cmdchar) {
  switch (props) {
    case 'list':
      return { ...action, type: 'user-list' }
    case 'add':
      return { ...action, type: 'user-add' }
  }
}

function handleChangePasswordCommand (action, props, cmdchar) {
  return { ...action, type: 'change-password' }
}

export function connectToConnection (action, connectionName, put, store) {
  const state = store.getState()
  connectionName = connectionName || DISCOVERY_CONNECTION_ID
  const foundConnections = connections
    .getConnections(state)
    .filter(c => c && c.name === connectionName)
  const connectionData = (foundConnections && foundConnections[0]) || {}
  return { ...action, type: 'connection', connectionData }
}

function handleServerAddCommand (action, cmdchar, put, store) {
  // :server add name username:password@host:port
  const [serverCmd, props] = splitStringOnFirst(
    splitStringOnFirst(action.cmd.substr(cmdchar.length), ' ')[1],
    ' '
  )
  const [name, creds] = splitStringOnFirst(props, ' ')
  let [userCreds, host] = splitStringOnLast(creds, '@')
  const [username, password] = splitStringOnFirst(userCreds, ':')
  try {
    if (!serverCmd || !props) throw new AddServerValidationError()
    if (!name || !creds) throw new AddServerValidationError()
    if (!userCreds || !host) throw new AddServerValidationError()
    if (!username || !password) throw new AddServerValidationError()
  } catch (e) {
    return { ...action, type: 'error', error: { message: getErrorMessage(e) } }
  }
  host = 'bolt://' + host.replace(/bolt:\/\//, '')
  put(connections.addConnection({ name, username, password, host }))
  const state = store.getState()
  return {
    ...action,
    type: 'pre',
    result: JSON.stringify(connections.getConnections(state), null, 2)
  }
}

function handleServerStatusCommand (action) {
  return { ...action, type: 'status' }
}

function handleServerSwitchCommand (action, props, store) {
  switch (props) {
    case 'success':
      const activeConnectionData = connections.getActiveConnectionData(
        store.getState()
      )
      const storeCredentials = shouldRetainConnectionCredentials(
        store.getState()
      )
      return {
        ...action,
        type: 'switch-success',
        activeConnectionData,
        storeCredentials
      }
    case 'fail':
      return { ...action, type: 'switch-fail' }
  }
}
