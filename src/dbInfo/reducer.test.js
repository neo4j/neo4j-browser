import {expect} from 'chai'
import dbInfo from '.'

describe('updating metadata', () => {
  it('should update state for labels when metadata is updated', () => {
    const initialState = []
    const returnedMeta = {
      a: 'labels',
      result: ['label1', 'label2'],
      get: (val) => { return ['label1', 'label2'] }

    }
    const action = {
      type: dbInfo.actionTypes.UPDATE_META,
      state: {meta: {records: [returnedMeta]}}
    }
    const nextState = dbInfo.reducer(initialState, action)
    expect(nextState).to.deep.equal(['label1', 'label2'])
  })
})
