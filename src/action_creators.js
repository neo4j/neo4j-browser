import uuid from 'uuid'

function toggleDrawer (id) {
  return {
    type: 'TOGGLE_DRAWER',
    state: {drawer: id}
  }
}

function addFrame (cmd) {
  return {
    type: 'ADD_FRAME',
    state: {cmd: cmd, id: uuid.v1()}
  }
}

export {
  toggleDrawer,
  addFrame
}
