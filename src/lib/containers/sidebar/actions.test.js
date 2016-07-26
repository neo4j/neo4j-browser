import {expect} from 'chai'
import sidebar from '.'

describe('Sidebar actions', () => {
  it('should handle toggling drawer', () => {
    const drawerId = 'db'
    expect(sidebar.actions.toggle(drawerId)).to.deep.equal({
      type: sidebar.actionTypes.TOGGLE,
      state: {drawer: drawerId}
    })
  })
})
