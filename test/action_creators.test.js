import {expect} from 'chai'
import { toggleDrawer } from '../src/action_creators'

describe('Action creators', () => {
  it('should handle toggleDrawer', () => {
    const drawerId = 'db'
    expect(toggleDrawer(drawerId)).to.deep.equal({
      type: 'TOGGLE_DRAWER',
      state: {drawer: drawerId}
    })
  })
})
