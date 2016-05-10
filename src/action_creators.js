import uuid from 'uuid'

function toggleDrawer (id) {
  return {
    type: 'TOGGLE_DRAWER',
    state: {drawer: id}
  }
}

function addFrame ({cmd, resultPromise}) {
  return {
    type: 'ADD_FRAME',
    state: {cmd: cmd, resultPromise: resultPromise, id: uuid.v1()}
  }
}

export {
  toggleDrawer,
  addFrame
}
