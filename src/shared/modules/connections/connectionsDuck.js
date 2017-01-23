const NAME = 'connections'

export const ADD = 'connections/ADD'
export const SET_ACTIVE = 'connections/SET_ACTIVE'
export const SELECT = 'connections/SELECT'

const initialState = {
  allConnectionIds: [],
  connectionsById: {},
  activeConnection: null
}

/**
 * Selectors
*/
export function getConnections (state) {
  return state[NAME].allConnectionIds.map((id) => state[NAME].connectionsById[id])
}

export function getActiveConnection (state) {
  return state[NAME].activeConnection
}

const addConnection = (state, obj) => {
  const connectionsById = {...state.connectionsById, [obj.id]: obj}
  let allConnectionIds = state.allConnectionIds
  if (state.allConnectionIds.indexOf(obj.id) < 0) {
    allConnectionIds = state.allConnectionIds.concat([obj.id])
  }
  return Object.assign(
    {},
    state,
    {allConnectionIds: allConnectionIds},
    {connectionsById: connectionsById}
  )
}

export default function (state = initialState, action) {
  switch (action.type) {
    case ADD:
      return addConnection(state, action.connection)
    case SET_ACTIVE:
      return {...state, activeConnection: action.connectionId}
    default:
      return state
  }
}

// Actions
export const selectConnection = (id) => {
  return {
    type: SELECT,
    connectionId: id
  }
}

export const setActiveConnection = (id) => {
  return {
    type: SET_ACTIVE,
    connectionId: id
  }
}

export const addConnection = ({name, username, password, host}) => {
  return {
    type: ADD,
    connection: {id: v4(), name, username, password, host, type: 'bolt'}
  }
}
