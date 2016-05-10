
const initialState = {
  cmdchar: ':'
}

export default function settings (state = initialState, action) {
  switch (action.type) {
    case 'UPDATE_SETTINGS':
      return Object.assign(state, action.state)
  }
  return state
}
