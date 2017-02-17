/* global test, expect, jest */
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
  const onRemoveClick = jest.fn()

  test('should delete user when remove is clicked', () => {
    const user = {username: 'Admin', roles: ['admin'], status: []}
    const wrapper = shallow(<UserInformation username={user.username} availableRoles={user.roles} roles={user.roles} status={user.status} onRemoveClick={onRemoveClick} />)
    wrapper.find('.delete').first().simulate('click')
    expect(onRemoveClick).toHaveBeenCalledWith(user.username)
  })
})
