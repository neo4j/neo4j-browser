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
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import bolt from 'services/bolt/bolt'
import { GlobalState } from 'shared/globalState'
import * as discovery from 'shared/modules/discovery/discoveryDuck'
import { AuthenticationMethod } from 'shared/types/auth'

export const NAME = 'connections'

// Action Types
export const CONNECTION_SUCCESS = 'connections/CONNECTION_SUCCESS'
export const DISCONNECTION_SUCCESS = 'connections/DISCONNECTION_SUCCESS'
export const SILENT_DISCONNECT = 'connections/SILENT_DISCONNECT'
export const SWITCH_CONNECTION = 'connections/SWITCH_CONNECTION'
export const SWITCH_CONNECTION_FAILED = 'connections/SWITCH_CONNECTION_FAILED'
export const INITIAL_SWITCH_CONNECTION_FAILED = 'connections/INITIAL_SWITCH_CONNECTION_FAILED'
export const VERIFY_CREDENTIALS = 'connections/VERIFY_CREDENTIALS'

// Connection States
export const PENDING_STATE = 'pending'
export const CONNECTED_STATE = 'connected'
export const DISCONNECTED_STATE = 'disconnected'
export const CONNECTING_STATE = 'connecting'

// Add these interfaces near the top of the file
export interface Connection {
  id?: string
  host: string
  username: string
  password: string
  authenticationMethod: AuthenticationMethod
  encrypted?: boolean
}

// Add this interface for the updateConnection action
export interface UpdateConnectionPayload {
  id: string
  host: string
  username: string
  password: string
  authenticationMethod: AuthenticationMethod
  encrypted?: boolean
}

export interface ConnectionState {
  connectionsById: Record<string, Connection>
  activeConnection: string | null
  lastUpdate: number
  connectionState: string
  host: string | null
  useDb: string | null
  authEnabled: boolean
}

// Update the initial state with the interface
const initialState: ConnectionState = {
  activeConnection: null,
  connectionsById: {},
  lastUpdate: 0,
  connectionState: DISCONNECTED_STATE,
  host: null,
  useDb: null,
  authEnabled: true
}

// Async Thunks
export const switchConnection = createAsyncThunk(
  'connections/switchConnection',
  async (connectionInfo: Omit<Connection, 'id'>, { dispatch }) => {
    try {
      const connectionWithId = {
        ...connectionInfo,
        id: discovery.CONNECTION_ID
      }
      dispatch(updateConnection(connectionWithId))
      
      const result = await bolt.openConnection(
        connectionWithId,
        { encrypted: true },
        (error: Error) => dispatch(connectionLost(error))
      )
      return result
    } catch (error) {
      throw error
    }
  }
)

// Slice
const connectionsSlice = createSlice({
  name: NAME,
  initialState,
  reducers: {
    updateConnection(state, action: { payload: UpdateConnectionPayload }) {
      const { id, ...connectionData } = action.payload
      if (id) {
        state.connectionsById[id] = { id, ...connectionData }
      }
    },
    setActiveConnection(state, action: { payload: string | null }) {
      state.activeConnection = action.payload
    },
    updateConnectionState(state, action: { payload: string }) {
      state.connectionState = action.payload
    },
    connectionLost(state, _action: { payload: Error }) {
      state.connectionState = DISCONNECTED_STATE
      // Handle any other state updates needed when connection is lost
    },
    disconnect(state) {
      state.connectionState = DISCONNECTED_STATE
      state.activeConnection = null
    },
    useDb(state, action: { payload: string | null }) {
      state.useDb = action.payload
    }
  },
  extraReducers: builder => {
    builder
      .addCase(switchConnection.pending, state => {
        state.connectionState = PENDING_STATE
      })
      .addCase(switchConnection.fulfilled, state => {
        state.connectionState = CONNECTED_STATE
        state.lastUpdate = Date.now()
      })
      .addCase(switchConnection.rejected, state => {
        state.connectionState = DISCONNECTED_STATE
      })
  }
})

// Actions
export const {
  updateConnection,
  setActiveConnection,
  updateConnectionState,
  connectionLost,
  disconnect: disconnectAction,
  useDb
} = connectionsSlice.actions

// Selectors
export const getActiveConnection = (state: GlobalState) => state[NAME].activeConnection
export const getActiveConnectionData = (state: GlobalState) => {
  const activeId = getActiveConnection(state)
  return activeId ? state[NAME].connectionsById[activeId] : null
}
export const getConnectionData = (state: GlobalState) => state[NAME].connectionsById
export const getConnectionState = (state: GlobalState) => state[NAME].connectionState
export const getLastConnectionUpdate = (state: GlobalState) => state[NAME].lastUpdate
export const getConnectedHost = (state: GlobalState) => state[NAME].host
export const getUseDb = (state: GlobalState) => state[NAME].useDb
export const getAuthEnabled = (state: GlobalState) => state[NAME].authEnabled
export const isConnected = (state: GlobalState) => 
  getConnectionState(state) === CONNECTED_STATE
export const isConnectedAuraHost = (state: GlobalState) => {
  const host = getConnectedHost(state)
  return host?.includes('neo4j.io') || false
}
export const getConnection = (state: GlobalState, id: string) => state[NAME].connectionsById[id]

export default connectionsSlice.reducer
