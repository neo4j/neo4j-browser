import {expect} from 'chai'
import user from '.'

describe('User info actions', () => {
  it('should handle updating current user', () => {
    const username = 'username'
    const roles = 'roles'
    const expectedUser = {username, roles}
    expect(user.actions.updateCurrentUser(username, roles)).to.deep.equal({
      type: user.actionTypes.UPDATE_CURRENT_USER,
      info: expectedUser
    })
  })
})
