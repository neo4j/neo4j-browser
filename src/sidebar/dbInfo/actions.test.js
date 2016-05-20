import {expect} from 'chai'
import dbInfo from '.'

describe('DB Info actions', () => {
  it('should handle updating metadata', () => {
    const metadata = 'meta object'
    expect(dbInfo.actions.updateMeta(metadata)).to.deep.equal({
      type: dbInfo.actionTypes.UPDATE_META,
      state: {meta: metadata}
    })
  })
})
