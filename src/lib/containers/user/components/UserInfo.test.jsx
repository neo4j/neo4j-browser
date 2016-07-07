import React from 'react'
import { UserInfoComponent } from './UserInfo'
import {expect} from 'chai'
import { shallow } from 'enzyme'

describe('UserInfo', () => {
  describe('current', () => {
    it('should show username and role of logged in user', () => {
      const info = {username: 'Admin', roles: ['admin']}
      const wrapper = shallow(<UserInfoComponent info={info} />)
      expect(wrapper.find('#db-user')).to.have.length(1)
      expect(wrapper.find('#db-user').text()).to.contain(info.username)
      expect(wrapper.find('#db-user').text()).to.contain(info.roles)
    })
  })
})
