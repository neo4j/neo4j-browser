import {expect} from 'chai'
import dbInfo from '.'

describe('updating metadata', () => {
  it('should update state when metadata is updated', () => {
    const initialState = []
    const returnedLabels = {
      a: 'labels',
      get: (val) => { return ['label1', 'label2'] }

    }
    const returnedRelationshipTypes = {
      a: 'relationshipTypes',
      get: (val) => { return ['rel1', 'rel2'] }

    }
    const returnedProperies = {
      a: 'properties',
      get: (val) => { return ['prop1', 'prop2'] }

    }
    const action = {
      type: dbInfo.actionTypes.UPDATE_META,
      state: {meta: {records: [ returnedLabels, returnedRelationshipTypes, returnedProperies ]}}
    }
    const nextState = dbInfo.reducer(initialState, action)
    expect(nextState.labels).to.deep.equal(['label1', 'label2'])
    expect(nextState.relationshipTypes).to.deep.equal(['rel1', 'rel2'])
    expect(nextState.properties).to.deep.equal(['prop1', 'prop2'])
  })

  it('should not update state when metadata has not changed', () => {
    const returnedLabels = {
      a: 'labels',
      get: (val) => { return ['label1', 'label2'] }

    }
    const returnedRelationshipTypes = {
      a: 'relationshipTypes',
      get: (val) => { return ['rel1', 'rel2'] }

    }
    const returnedProperies = {
      a: 'properties',
      get: (val) => { return ['prop1', 'prop2'] }

    }
    const initialState = { labels: ['label1', 'label2'], relationshipTypes: ['rel1', 'rel2'], properties: ['prop1', 'prop2'] }
    const action = {
      type: dbInfo.actionTypes.UPDATE_META,
      state: {meta: {records: [ returnedLabels, returnedRelationshipTypes, returnedProperies ]}}
    }
    const nextState = dbInfo.reducer(initialState, action)
    expect(nextState).to.equal(initialState)
  })
})
