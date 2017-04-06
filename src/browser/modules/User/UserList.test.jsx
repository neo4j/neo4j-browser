/* global test, expect */
import React from 'react'
import { shallow } from 'enzyme'

import { UserList } from './UserList'

const mockBus = {self: () => {}}

describe('UserList', () => {
  test('should show list of database users by username', () => {
    const props = {
      users: [
        ['Admin', ['admin'], []],
        ['Thing', ['thing'], []]
      ]
    }
    const wrapper = shallow(shallow(<UserList bus={mockBus} {...props} />).props().contents)
    expect(wrapper.find('.user-information').length).toBe(2)
  })

  test.skip('should show list of database users by role', () => {
    const roles = ['user1', 'user2']
    const props = {roles: roles}
    const wrapper = shallow(shallow(<UserList bus={mockBus} {...props} />).contents)
    expect(wrapper.find('.roles').text()).toEqual('user1, user2')
  })
})
