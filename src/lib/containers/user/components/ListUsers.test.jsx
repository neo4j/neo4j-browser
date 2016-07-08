import React from 'react'
import { ListUsersComponent } from './ListUsers'
import { UserDetailsComponent } from './UserDetails'
import { expect } from 'chai'
import { mount, shallow } from 'enzyme'

describe('ListUsers', () => {
  it('should show list of database users by username', () => {
    const users = [{username: 'Admin', role: ['admin']}, {username: 'User', role: ['reader']}]
    const props = {users: users}
    const wrapper = mount(<ListUsersComponent {...props} />)
    expect(wrapper.find(UserDetailsComponent)).to.have.length(2)
  })

  it('should show list of database users by role', () => {
    const roles = ['somerole', ['user1', 'user2']]
    const props = {roles: roles}
    const wrapper = shallow(<ListUsersComponent {...props} />)
    expect(wrapper.find('.roles')).to.contain(JSON.stringify(roles))
  })
})
