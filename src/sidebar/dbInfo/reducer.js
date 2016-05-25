import * as t from './actionTypes'

export default function labels (state = {}, action) {
  switch (action.type) {
    case t.UPDATE_META:
      return {
        labels: action.state.meta.records[0].get(1),
        relationshipTypes: action.state.meta.records[1].get(1),
        properties: action.state.meta.records[2].get(1)
      }
  }
  return state
}
