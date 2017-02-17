import 'rxjs'
import bolt from 'services/bolt/bolt'

export const NAME = 'requests'
export const REQUEST_SENT = NAME + '/SENT'
export const CANCEL_REQUEST = NAME + '/CANCEL'
export const REQUEST_CANCELED = NAME + '/CANCELED'
export const REQUEST_UPDATED = NAME + '/UPDATED'

const initialState = {}

export const getRequest = (state, id) => state[NAME][id]
export const getRequests = (state) => state[NAME]

export default function reducer (state = initialState, action) {
  switch (action.type) {
    case REQUEST_SENT:
      return Object.assign({}, state, {[action.id]: {result: undefined, status: 'pending', type: action.requestType}})
    case REQUEST_CANCELED:
    case REQUEST_UPDATED:
      const newRequest = Object.assign({}, state[action.id], {result: action.result, status: action.status})
      return Object.assign({}, state, {[action.id]: newRequest})
    default:
      return state
  }
}

export const send = (requestType, id) => {
  return {
    type: REQUEST_SENT,
    requestType,
    id: id
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

export const cancel = (id) => {
  return {
    type: CANCEL_REQUEST,
    id
  }
}

const canceled = (id) => {
  return {
    type: REQUEST_CANCELED,
    status: 'canceled',
    result: null,
    id
  }
}

// Epics
export const cancelRequestEpic = (action$, store) =>
  action$.ofType(CANCEL_REQUEST)
    .mergeMap((action) => {
      return new Promise((resolve, reject) => {
        bolt.cancelTransaction(action.id, () => {
          resolve(canceled(action.id))
        })
      })
    })
