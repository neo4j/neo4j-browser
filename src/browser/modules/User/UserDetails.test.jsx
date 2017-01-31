/* global test, expect, jest */
import React from 'react'
import UserDetails from './UserDetails'
import { shallow } from 'enzyme'

describe('UserDetails', () => {
  test('should show username and role of a user', () => {
    const user = {username: 'user', roles: ['roles']}
    const wrapper = shallow(<UserDetails username={user.username} roles={user.roles} />)
    expect(wrapper.find('.user-info').length).toBe(1)
    expect(wrapper.find('.user-info .username').text()).toMatch(user.username)
    expect(wrapper.find('.roles').first().html()).toMatch(user.roles[0])
  })
  const onRemoveClick = jest.fn()

  test('should delete user when remove is clicked', () => {
    const user = {username: 'Admin', roles: ['admin']}
    const wrapper = shallow(<UserDetails username={user.username} roles={user.roles} onRemoveClick={onRemoveClick} />)
    wrapper.find('button').first().simulate('click')
    expect(onRemoveClick).toHaveBeenCalledWith(user.username)
  })
})
