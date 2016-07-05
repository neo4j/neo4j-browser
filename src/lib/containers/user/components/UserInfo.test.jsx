import React from 'react'
import { UserInfoComponent } from './UserInfo'
import {expect} from 'chai'
import { shallow } from 'enzyme'

describe('UserInfo', () => {
  it('should show username and role of logged in user', () => {
    const info = {username: 'Admin', role: ['admin']}
    const wrapper = shallow(<UserInfoComponent username={info.username} role={info.role} />)
    expect(wrapper.find('#db-user')).to.have.length(1)
    expect(wrapper.find('#db-user').text()).to.contain(info.username)
    expect(wrapper.find('#db-user').text()).to.contain(info.role)
  })
})
