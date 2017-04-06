/* global test, expect */
import React from 'react'
import { UserAdd } from './UserAdd'
import { shallow } from 'enzyme'

const mockBus = {self: () => {}}

describe('UserAdd', () => {
  test('should show filtered list of roles', () => {
    const user = {username: 'user', roles: ['a', 'b'], status: []}
    const wrapper = shallow(<UserAdd bus={mockBus} username={user.username} availableRoles={['a', 'b', 'c']} roles={user.roles} status={user.status} />)
    expect(wrapper.instance().availableRoles()).toEqual(['c'])
    expect(wrapper.state().roles).toEqual(['a', 'b'])
  })
  test('should remove role from the users assigned roles', () => {
    const user = {username: 'user', roles: ['a', 'b', 'c'], status: []}
    const wrapper = shallow(<UserAdd bus={mockBus} username={user.username} availableRoles={user.roles} roles={user.roles} status={user.status} />)
    expect(wrapper.instance().removeRole('a')).toEqual(['b', 'c'])
  })
})
