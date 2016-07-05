import React from 'react'
import { ListUsersComponent } from './ListUsers'
import { expect } from 'chai'
import { shallow } from 'enzyme'

describe('ListUsers', () => {
  it('should show username and role of logged in user', () => {
    const users = [{username: 'Admin', role: ['admin']}, {username: 'User', role: ['reader']}]
    const wrapper = shallow(<ListUsersComponent users={users} />)
    expect(wrapper.find('#db-list-users')).to.have.length(1)
    expect(wrapper.find('#db-list-users').text()).to.contain('Admin')
    expect(wrapper.find('#db-list-users').text()).to.contain('User')
  })
})
