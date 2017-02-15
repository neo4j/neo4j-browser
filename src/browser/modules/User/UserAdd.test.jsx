/* global test, expect */
import React from 'react'
import UserAdd from './UserAdd'
import { shallow } from 'enzyme'

describe('UserAdd', () => {
  test('should show filter available roles', () => {
    const user = {username: 'user', roles: ['b'], status: []}
    const wrapper = shallow(<UserAdd username={user.username} availableRoles={['a', 'b', 'c']} roles={user.roles} status={user.status} />)
    expect(wrapper.instance().availableRoles()).toEqual(['a', 'c'])
  })
})
