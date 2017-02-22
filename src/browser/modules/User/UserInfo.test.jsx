/* global test, expect */
import React from 'react'
import { UserInfoComponent } from './UserInfo'
import { shallow } from 'enzyme'

describe('UserInfo', () => {
  const mockBus = { self: () => {} }
  test('should show username and role of logged in user', () => {
    const info = {username: 'Admin', roles: ['admin']}
    const wrapper = shallow(<UserInfoComponent bus={mockBus} info={info} />)
    expect(wrapper.find('#db-user').length).toBe(1)
    expect(wrapper.find('#db-user').text()).toMatch(info.username)
    expect(wrapper.find('#db-user').text()).toMatch(info.roles[0])
  })
})
