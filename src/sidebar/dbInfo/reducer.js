import * as t from './actionTypes'
import { deepEquals } from '../../services/utils'

export default function labels (state = {}, action) {
  switch (action.type) {
    case t.UPDATE_META:
      const newLabels = action.state.meta.records[0].get(1)
      const newRelationshipTypes = action.state.meta.records[1].get(1)
      const newProperties = action.state.meta.records[2].get(1)
      if (!deepEquals(newLabels, state.labels) || !deepEquals(newRelationshipTypes, state.relationshipTypes) || !deepEquals(newProperties, state.properties)) {
        return {
          labels: newLabels,
          relationshipTypes: newRelationshipTypes,
          properties: newProperties
        }
      }
      return state
    default:
      return state
  }
}
