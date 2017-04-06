/* global test, expect */
import reducer, * as meta from './dbMetaDuck'

describe('updating metadata', () => {
  test('should update state when metadata is updated', () => {
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
      type: meta.UPDATE,
      meta: {records: [ returnedLabels, returnedRelationshipTypes, returnedProperies ]},
      context: 'mycontext'
    }
    const nextState = reducer(undefined, action)
    expect(nextState.labels).toEqual([{val: 'label1', context: 'mycontext'}, {val: 'label2', context: 'mycontext'}])
    expect(nextState.relationshipTypes).toEqual([{val: 'rel1', context: 'mycontext'}, {val: 'rel2', context: 'mycontext'}])
    expect(nextState.properties).toEqual([{val: 'prop1', context: 'mycontext'}, {val: 'prop2', context: 'mycontext'}])
  })

  // test('should not update state when metadata has not changed', () => {
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
  //   const nextState = reducer(initialState, action)
  //   expect(nextState).toEqual(initialState)
  // })
})
