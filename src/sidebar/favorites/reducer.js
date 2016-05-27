import * as t from './actionTypes'

export default function load (state = { scripts: [ { name: 'Example', content: 'match (n) return n limit 1' } ] }, action) {
  switch (action.type) {
    case t.LOAD_FAVORITES:
      return {
        scripts: action.state.favorites
      }
  }
  return state
}
