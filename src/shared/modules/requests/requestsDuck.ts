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
import { QueryResult } from 'neo4j-driver'
import { Action } from 'redux'
import { Epic } from 'redux-observable'
import 'rxjs'

import bolt from 'services/bolt/bolt'
import { BrowserError } from 'services/exceptions'
import { GlobalState } from 'shared/globalState'
import { APP_START, AppStartAction } from 'shared/modules/app/appDuck'

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

export type RequestState = Record<string, BrowserRequest>
const initialState: RequestState = {}

export const getRequest = (state: GlobalState, id: string): BrowserRequest =>
  state[NAME][id]
export const getRequests = (state: GlobalState): RequestState => state[NAME]
export const isCancelStatus = (status: Status): boolean =>
  [REQUEST_STATUS_CANCELED, REQUEST_STATUS_CANCELING].includes(status)

export type Status =
  | 'ignored'
  | 'skipped'
  | 'pending'
  | 'success'
  | 'waiting'
  | 'error'
  | 'canceling'
  | 'canceled'

export type BrowserRequestResult = undefined | null | QueryResult | BrowserError

export type BrowserRequest = {
  result: BrowserRequestResult
  status: Status
  type: string
  id?: string
  updated?: number
}

export default function reducer(
  state: RequestState = initialState,
  action: RequestsActionsUnion
): RequestState {
  switch (action.type) {
    case APP_START:
      return { ...initialState, ...state }
    case REQUEST_SENT:
      return {
        ...state,

        [action.id]: {
          result: undefined,
          status: 'pending',
          type: 'cypher'
        }
      }
    case CANCEL_REQUEST:
    case REQUEST_CANCELED:
    case REQUEST_UPDATED:
      const newRequest: BrowserRequest = {
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

type RequestsActionsUnion =
  | SendAction
  | UpdateAction
  | CancelAction
  | CanceledAction
  | AppStartAction

interface SendAction {
  type: typeof REQUEST_SENT
  id: string
}

export const send = (id: string): SendAction => ({
  type: REQUEST_SENT,
  id
})

interface UpdateAction {
  type: typeof REQUEST_UPDATED
  id: string
  result: BrowserRequestResult
  status: Status
}

export const update = (
  id: string,
  result: BrowserRequestResult,
  status: Status
): UpdateAction => ({
  type: REQUEST_UPDATED,
  id,
  result,
  status
})

interface CancelAction {
  type: typeof CANCEL_REQUEST
  status: typeof REQUEST_STATUS_CANCELING
  id: string
  result: undefined
}

export const cancel = (id: string): CancelAction => ({
  type: CANCEL_REQUEST,
  status: REQUEST_STATUS_CANCELING,
  id,
  result: undefined
})

interface CanceledAction {
  type: typeof REQUEST_CANCELED
  status: typeof REQUEST_STATUS_CANCELED
  result: null
  id: string
}

const canceled = (id: string): CanceledAction => ({
  type: REQUEST_CANCELED,
  status: REQUEST_STATUS_CANCELED,
  result: null,
  id
})

export const cancelRequestEpic: Epic<Action, GlobalState> = action$ =>
  action$.ofType(CANCEL_REQUEST).mergeMap(
    action =>
      new Promise(resolve => {
        bolt.cancelTransaction((action as CancelAction).id, () => {
          resolve(canceled((action as CancelAction).id))
        })
      })
  )
