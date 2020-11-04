/*
 * Copyright (c) 2002-2021 "Neo4j,"
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

import 'rxjs'
import bolt from 'services/bolt/bolt'
import { APP_START } from 'shared/modules/app/appDuck'

export const NAME = 'requests'
export const REQUEST_SENT = 'requests/SENT'
export const CANCEL_REQUEST = 'requests/CANCEL'
export const REQUEST_CANCELED = 'requests/CANCELED'
export const REQUEST_UPDATED = 'requests/UPDATED'

export const REQUEST_STATUS_PENDING = 'pending'
export const REQUEST_STATUS_SUCCESS = 'success'
export const REQUEST_STATUS_ERROR = 'error'
export const REQUEST_STATUS_CANCELING = 'canceling'
export const REQUEST_STATUS_CANCELED = 'canceled'

type RequestStatus = 'pending' | 'success' | 'error' | 'canceling' | 'canceled'
// hmm look into this

type RequestId = string
export type RequestState = Record<RequestId, Request>
type GlobalState = { [NAME]: RequestState }
const initialState: RequestState = {}

export const getRequest = (state: GlobalState, id: RequestId): Request =>
  state[NAME][id]
export const getRequests = (state: GlobalState): RequestState => state[NAME]
export const isCancelStatus = (status: RequestStatus): boolean =>
  [REQUEST_STATUS_CANCELED, REQUEST_STATUS_CANCELING].includes(status)

export type Status =
  | 'ignored'
  | 'skipped'
  | 'pending'
  | 'success'
  | 'waiting'
  | 'error'

export type Request = {
  result?: any
  status: Status
  type: any
  id?: string
  updated?: number
}
// does it make sense to put the id in the object?

export default function reducer(
  state: RequestState = initialState,
  action: any
) {
  switch (action.type) {
    case APP_START:
      return { ...initialState, ...state }
    case REQUEST_SENT:
      return {
        ...state,

        [action.id]: {
          result: undefined,
          status: 'pending',
          type: action.requestType
        }
      }
    case CANCEL_REQUEST:
    case REQUEST_CANCELED:
    case REQUEST_UPDATED:
      const newRequest = {
        ...state[action.id],
        result: action.result,
        status: action.status,
        updated: new Date().getTime()
      }
      return {
        ...state,
        [action.id]: newRequest
      }
    default:
      return state
  }
}

export const send = (requestType: any, id: RequestId) => ({
  type: REQUEST_SENT,
  requestType,
  id
})

export const update = (id: RequestId, result: any, status: Status) => ({
  type: REQUEST_UPDATED,
  id,
  result,
  status
})

export const cancel = (id: RequestId) => ({
  type: CANCEL_REQUEST,
  status: REQUEST_STATUS_CANCELING,
  id
})

const canceled = (id: RequestId) => ({
  type: REQUEST_CANCELED,
  status: REQUEST_STATUS_CANCELED,
  result: null,
  id
})

// Epics
export const cancelRequestEpic = (action$: any) =>
  action$.ofType(CANCEL_REQUEST).mergeMap(
    (action: any) =>
      new Promise(resolve => {
        bolt.cancelTransaction(action.id, () => {
          resolve(canceled(action.id))
        })
      })
  )
