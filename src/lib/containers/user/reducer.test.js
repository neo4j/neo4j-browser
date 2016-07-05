import {expect} from 'chai'
import user from '.'

describe('user reducer current info', () => {
  it('handles unknown action type', () => {
    const action = {
      type: 'UNKNOWN',
      info: {}
    }
    const nextState = user.reducer(undefined, action)
    expect(nextState).to.deep.equal({info: null})
  })
  it('should have no info', () => {
    const action = {
      type: user.actionTypes.UPDATE_CURRENT_USER,
      info: null
    }
    const nextState = user.reducer(undefined, action)
    expect(nextState).to.include.keys('info')
    expect(nextState.info).to.equal(null)
  })
  it('should set info', () => {
    const action = {
      type: user.actionTypes.UPDATE_CURRENT_USER,
      info: {username: 'username', roles: ['king']}
    }
    const nextState = user.reducer({a: 'b'}, action)
    expect(nextState.info).to.deep.equal({username: 'username', roles: ['king']})
  })
})
