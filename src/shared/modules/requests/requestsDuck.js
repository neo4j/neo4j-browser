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

import 'rxjs'
import bolt from 'services/bolt/bolt'
import { APP_START } from 'shared/modules/app/appDuck'

export const NAME = 'requests'
export const REQUEST_SENT = `${NAME}/SENT`
export const CANCEL_REQUEST = `${NAME}/CANCEL`
export const REQUEST_CANCELED = `${NAME}/CANCELED`
export const REQUEST_UPDATED = `${NAME}/UPDATED`

export const REQUEST_STATUS_PENDING = 'pending'
export const REQUEST_STATUS_SUCCESS = 'success'
export const REQUEST_STATUS_ERROR = 'error'
export const REQUEST_STATUS_CANCELING = 'canceling'
export const REQUEST_STATUS_CANCELED = 'canceled'

const initialState = {}

export const getRequest = (state, id) => state[NAME][id]
export const getRequests = state => state[NAME]
export const isCancelStatus = status =>
  [REQUEST_STATUS_CANCELED, REQUEST_STATUS_CANCELING].includes(status)

export default function reducer(state = initialState, action) {
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

export const send = (requestType, id) => {
  return {
    type: REQUEST_SENT,
    requestType,
    id
  }
}

export const update = (id, result, status) => {
  return {
    type: REQUEST_UPDATED,
    id,
    result,
    status
  }
}

export const cancel = id => {
  return {
    type: CANCEL_REQUEST,
    status: REQUEST_STATUS_CANCELING,
    id
  }
}

const canceled = id => {
  return {
    type: REQUEST_CANCELED,
    status: REQUEST_STATUS_CANCELED,
    result: null,
    id
  }
}

// Epics
export const cancelRequestEpic = (action$, store) =>
  action$.ofType(CANCEL_REQUEST).mergeMap(action => {
    return new Promise((resolve, reject) => {
      bolt.cancelTransaction(action.id, () => {
        resolve(canceled(action.id))
      })
    })
  })
