import React from 'react'
import { ListUsersComponent } from './ListUsers'
import { UserDetailsComponent } from './UserDetails'
import { expect } from 'chai'
import { mount } from 'enzyme'

describe('ListUsers', () => {
  it('should show list of database users', () => {
    const users = [{username: 'Admin', role: ['admin']}, {username: 'User', role: ['reader']}]
    const wrapper = mount(<ListUsersComponent users={users} />)
    expect(wrapper.find(UserDetailsComponent)).to.have.length(2)
  })
})
