import {expect} from 'chai'
import reducer, * as currentUser from './currentUserDuck'

describe('user reducer current info', () => {
  it('handles unknown action type', () => {
    const action = {
      type: 'UNKNOWN',
      info: {}
    }
    const nextState = reducer(undefined, action)
    expect(nextState).to.deep.equal({info: null})
  })
  it('should have no info', () => {
    const action = {
      type: currentUser.UPDATE_CURRENT_USER,
      info: null
    }
    const nextState = reducer(undefined, action)
    expect(nextState).to.include.keys('info')
    expect(nextState.info).to.equal(null)
  })
  it('should set info', () => {
    const action = {
      type: currentUser.UPDATE_CURRENT_USER,
      info: {username: 'username', roles: ['king']}
    }
    const nextState = reducer({a: 'b'}, action)
    expect(nextState.info).to.deep.equal({username: 'username', roles: ['king']})
  })
})

describe('User info actions', () => {
  it('should handle updating current user', () => {
    const username = 'username'
    const roles = 'roles'
    const expectedUser = {username, roles}
    expect(currentUser.updateCurrentUser(username, roles)).to.deep.equal({
      type: currentUser.UPDATE_CURRENT_USER,
      info: expectedUser
    })
  })
})
