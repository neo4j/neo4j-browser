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

import { getCommandAndParam } from 'services/commandUtils'
import * as connections from 'shared/modules/connections/connectionsDuck'
import { add as addFrameAction } from 'shared/modules/stream/streamDuck'
import { CONNECTION_ID as DISCOVERY_CONNECTION_ID } from 'shared/modules/discovery/discoveryDuck'
import { UnknownCommandError, getErrorMessage } from 'services/exceptions'
import { shouldRetainConnectionCredentials } from 'shared/modules/dbMeta/dbMetaDuck'

export function handleServerCommand(action, cmdchar, put, store) {
  const [serverCmd, props] = getCommandAndParam(
    action.cmd.substr(cmdchar.length)
  )

  if (serverCmd === 'connect') {
    return connectToConnection(action, props, put, store)
  }
  if (serverCmd === 'disconnect') {
    return handleDisconnectCommand(action, props, put, store)
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

function handleDisconnectCommand(action, cmdchar, put, store) {
  put(addFrameAction({ ...action, type: 'disconnect' }))
  const activeConnection = connections.getActiveConnection(store.getState())
  const disconnectAction = connections.disconnectAction(activeConnection)
  put(disconnectAction)
  return null
}

function handleUserCommand(action, props, cmdchar) {
  switch (props) {
    case 'list':
      return { ...action, type: 'user-list' }
    case 'add':
      return { ...action, type: 'user-add' }
  }
}

function handleChangePasswordCommand(action, props, cmdchar) {
  return { ...action, type: 'change-password' }
}

export function connectToConnection(action, name, put, store) {
  const state = store.getState()
  const connectionName = name || DISCOVERY_CONNECTION_ID
  const foundConnections = connections
    .getConnections(state)
    .filter(c => c && c.name === connectionName)
  const connectionData = (foundConnections && foundConnections[0]) || {}
  return { ...action, type: 'connection', connectionData }
}

function handleServerStatusCommand(action) {
  return { ...action, type: 'status' }
}

function handleServerSwitchCommand(action, props, store) {
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
