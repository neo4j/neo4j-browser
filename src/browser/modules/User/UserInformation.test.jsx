/* global test, expect */
import React from 'react'
import { UserInformation } from './UserInformation'
import { shallow } from 'enzyme'

const mockBus = {self: () => {}}

describe('UserInformation', () => {
  test('should show username and role of a user', () => {
    const user = {username: 'user', roles: ['roles'], status: []}
    const wrapper = shallow(<UserInformation bus={mockBus} username={user.username} roles={user.roles} status={user.status} />)
    expect(wrapper.find('.user-info').length).toBe(1)
    expect(wrapper.find('.user-info .username').text()).toMatch(user.username)
    expect(wrapper.find('.roles').first().html()).toMatch(user.roles[0])
  })
})
