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
import { authLog } from 'neo4j-client-sso'
import bolt from 'services/bolt/bolt'
import { UnauthorizedDriverError } from 'services/bolt/boltConnectionErrors'
import { NATIVE, NO_AUTH, SSO } from 'services/bolt/boltHelpers'
import { GlobalState } from 'shared/globalState'
import * as discovery from 'shared/modules/discovery/discoveryDuck'
import { executeSystemCommand } from 'shared/modules/commands/commandsDuck'

export const NAME = 'connections'

export const switchConnectionFailed = () => ({ type: SWITCH_CONNECTION_FAILED })

export const switchConnectionEpic = (action$: any, store: any) => {
  return action$.pipe(
    ofType(SWITCH_CONNECTION),
    tap(() => store.dispatch(updateConnectionState(PENDING_STATE))),
    mergeMap((action: any) => {
      bolt.closeConnection()
      const connectionInfo = { id: discovery.CONNECTION_ID, ...action }
      store.dispatch(updateConnection(connectionInfo))
      return new Promise(resolve => {
        bolt
          .openConnection(
            action,
            { encrypted: action.encrypted },
            onLostConnection(store.dispatch)
          )
          .then(() => {
            store.dispatch(updateConnectionState(CONNECTED_STATE))
            resolve(null)
          })
          .catch(e => {
            store.dispatch(updateConnectionState(DISCONNECTED_STATE))
            store.dispatch({ type: SWITCH_CONNECTION_FAILED })
            resolve(e)
          })
      })
    })
  )
}
