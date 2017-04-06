/* global test, expect */
import reducer, * as currentUser from './currentUserDuck'

describe('user reducer current info', () => {
  test('handles unknown action type', () => {
    const action = {
      type: 'UNKNOWN',
      info: {}
    }
    const nextState = reducer(undefined, action)
    expect(nextState).toEqual({info: null})
  })
  test('should have no info', () => {
    const action = {
      type: currentUser.UPDATE_CURRENT_USER,
      info: null
    }
    const nextState = reducer(undefined, action)
    expect(Object.keys(nextState).indexOf('info')).toBeGreaterThan(-1)
    expect(nextState.info).toEqual(null)
  })
  test('should set info', () => {
    const action = {
      type: currentUser.UPDATE_CURRENT_USER,
      info: {username: 'username', roles: ['king']}
    }
    const nextState = reducer({a: 'b'}, action)
    expect(nextState.info).toEqual({username: 'username', roles: ['king']})
  })
})

describe('User info actions', () => {
  test('should handle updating current user', () => {
    const username = 'username'
    const roles = 'roles'
    const expectedUser = {username, roles}
    expect(currentUser.updateCurrentUser(username, roles)).toEqual({
      type: currentUser.UPDATE_CURRENT_USER,
      info: expectedUser
    })
  })
})
