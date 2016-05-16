import * as t from './actionTypes'

export default function labels (state = '', action) {
  switch (action.type) {
    case t.UPDATE_META:
      return action.state.meta.records[0].get(1)
  }
  return state
}
