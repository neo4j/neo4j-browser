/* global test, expect */
import React from 'react'
import { UserList } from './UserList'
import UserDetails from './UserDetails'
import { shallow } from 'enzyme'

describe('UserList', () => {
  test('should show list of database users by username', () => {
    const users = [{username: 'Admin', role: ['admin']}, {username: 'User', role: ['reader']}]
    const props = {users: users}

    const wrapper = shallow(shallow(<UserList {...props} />).props().contents)
    expect(wrapper.find(UserDetails).length).toBe(2)
  })

  test('should show list of database users by role', () => {
    const roles = ['user1', 'user2']
    const props = {roles: roles}
    const wrapper = shallow(shallow(<UserList {...props} />).props().contents)
    expect(wrapper.find('.roles').text()).toEqual('user1, user2')
  })
})
