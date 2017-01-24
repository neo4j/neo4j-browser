import React from 'react'
import { ListUsers } from './ListUsers'
import UserDetails from './UserDetails'
import { expect } from 'chai'
import { mount, shallow } from 'enzyme'

describe('ListUsers', () => {
  it('should show list of database users by username', () => {
    const users = [{username: 'Admin', role: ['admin']}, {username: 'User', role: ['reader']}]
    const props = {users: users}
    const wrapper = mount(<ListUsers {...props} />)
    expect(wrapper.find(UserDetails)).to.have.length(2)
  })

  it('should show list of database users by role', () => {
    const roles = ['user1', 'user2']
    const props = {roles: roles}
    const wrapper = shallow(<ListUsers {...props} />)
    expect(wrapper.find('.roles').text()).to.equal('user1, user2')
  })
})
