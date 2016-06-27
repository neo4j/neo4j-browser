import {expect} from 'chai'
import dbInfo from '.'

describe('updating metadata', () => {
  it('should update state when metadata is updated', () => {
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
      meta: {records: [ returnedLabels, returnedRelationshipTypes, returnedProperies ]},
      context: 'mycontext'
    }
    const nextState = dbInfo.reducer(undefined, action)
    expect(nextState.labels).to.deep.equal([{val: 'label1', context: 'mycontext'}, {val: 'label2', context: 'mycontext'}])
    expect(nextState.relationshipTypes).to.deep.equal([{val: 'rel1', context: 'mycontext'}, {val: 'rel2', context: 'mycontext'}])
    expect(nextState.properties).to.deep.equal([{val: 'prop1', context: 'mycontext'}, {val: 'prop2', context: 'mycontext'}])
  })

  // it('should not update state when metadata has not changed', () => {
  //   const returnedLabels = {
  //     a: 'labels',
  //     get: (val) => { return ['label1', 'label2'] }
  //
  //   }
  //   const returnedRelationshipTypes = {
  //     a: 'relationshipTypes',
  //     get: (val) => { return ['rel1', 'rel2'] }
  //
  //   }
  //   const returnedProperies = {
  //     a: 'properties',
  //     get: (val) => { return ['prop1', 'prop2'] }
  //
  //   }
  //   const initialState = { labels: ['label1', 'label2'], relationshipTypes: ['rel1', 'rel2'], properties: ['prop1', 'prop2'] }
  //   const action = {
  //     type: dbInfo.actionTypes.UPDATE_META,
  //     state: {meta: {records: [ returnedLabels, returnedRelationshipTypes, returnedProperies ]}}
  //   }
  //   const nextState = dbInfo.reducer(initialState, action)
  //   expect(nextState).to.equal(initialState)
  // })
})
