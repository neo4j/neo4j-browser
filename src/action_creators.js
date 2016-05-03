
function toggleDrawer (id) {
  return {
    type: 'TOGGLE_DRAWER',
    state: {drawer: id}
  }
}

export {
  toggleDrawer
}
