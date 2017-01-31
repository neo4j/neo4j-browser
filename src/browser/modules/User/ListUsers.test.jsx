/* global test, expect */
import React from 'react'
import { ListUsers } from './ListUsers'
import UserDetails from './UserDetails'
import { mount, shallow } from 'enzyme'

describe('ListUsers', () => {
  test('should show list of database users by username', () => {
    const users = [{username: 'Admin', role: ['admin']}, {username: 'User', role: ['reader']}]
    const props = {users: users}
    const wrapper = mount(<ListUsers {...props} />)
    expect(wrapper.find(UserDetails).length).toBe(2)
  })

  test('should show list of database users by role', () => {
    const roles = ['user1', 'user2']
    const props = {roles: roles}
    const wrapper = shallow(<ListUsers {...props} />)
    expect(wrapper.find('.roles').text()).toEqual('user1, user2')
  })
})
