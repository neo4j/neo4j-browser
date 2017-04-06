
export const makeConnectionsInitialState = (connectionsReducer) => {
  return (key, val) => {
    if (key !== 'connections') return val
    if (!val) {
      val = connectionsReducer(undefined, '')
    }
    const out = {}
    out.allConnectionIds = [].concat(val.allConnectionIds)
    out.connectionsById = Object.assign({}, val.connectionsById)
    out.activeConnection = 'offline' // Always start in offline mode

    // If offline exists, return
    if (val.allConnectionIds.indexOf('offline') > -1) return out

    // If not, add it
    out.allConnectionIds = ['offline'].concat(out.allConnectionIds)
    out.connectionsById = Object.assign(out.connectionsById, {'offline': {name: 'Offline', type: 'offline', id: 'offline'}})
    return out
  }
}

export const makeConnectionsPersistedState = () => {
  return (key, val) => {
    if (key !== 'connections') return val
    if (!val) return val
    const out = {}
    out.allConnectionIds = [].concat(val.allConnectionIds)
    out.connectionsById = Object.assign({}, val.connectionsById)
    out.activeConnection = 'offline' // To start in offline mode
    return out
  }
}
