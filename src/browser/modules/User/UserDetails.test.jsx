import React from 'react'
import UserDetails from './UserDetails'
import chai, { expect } from 'chai'
import { shallow } from 'enzyme'
import chaiEnzyme from 'chai-enzyme'
import spies from 'chai-spies'

describe('UserDetails', () => {
  it('should show username and role of a user', () => {
    const user = {username: 'user', roles: ['roles']}
    const wrapper = shallow(<UserDetails username={user.username} roles={user.roles} />)
    expect(wrapper.find('.user-info')).to.have.length(1)
    expect(wrapper.find('.user-info .username').text()).to.contain(user.username)
    expect(wrapper.find('.roles').first().html()).to.contain(user.roles[0])
  })

  chai.use(spies)
  chai.use(chaiEnzyme())
  const onRemoveClick = chai.spy()

  it('should delete user when remove is clicked', () => {
    const user = {username: 'Admin', roles: ['admin']}
    const wrapper = shallow(<UserDetails username={user.username} roles={user.roles} onRemoveClick={onRemoveClick} />)
    wrapper.find('button').first().simulate('click')
    expect(onRemoveClick).to.have.been.called.with(user.username)
  })
})
