import React from 'react'
import { UserDetails } from './UserDetails'
import { expect } from 'chai'
import { shallow } from 'enzyme'

describe('connected as', () => {
  it('should not show user details if not connected', () => {
    const userDetails = null
    const wrapper = shallow(<UserDetails userDetails={userDetails} />)
    expect(wrapper.find('.user-details')).to.have.length(0)
  })
  it('should show username when connected', () => {
    const userDetails = {
      username: 'test',
      roles: []
    }
    const wrapper = shallow(<UserDetails userDetails={userDetails} />)
    expect(wrapper.find('.user-details')).to.not.have.length(0)
    expect(wrapper.find('.username').text()).to.equal('test')
    expect(wrapper.find('.roles').text()).to.equal('-')
  })
  it('should show user role when connected', () => {
    const userDetails = {
      username: 'any',
      roles: ['ADMIN', 'READER']
    }
    const wrapper = shallow(<UserDetails userDetails={userDetails} />)
    expect(wrapper.find('.roles').text()).to.equal('ADMIN, READER')
  })
  it('not should display admin functions when user is not assigned the "admin" role', () => {
    const userDetails = {
      username: 'any',
      roles: ['READER']
    }
    const wrapper = shallow(<UserDetails userDetails={userDetails} />)
    expect(wrapper.find('.roles').text()).to.equal('READER')
    expect(wrapper.find('.user-list-button')).to.have.length(0)
  })
  it('should display admin functions when user is assigned the "admin" role', () => {
    const userDetails = {
      username: 'any',
      roles: ['ADMIN']
    }
    const wrapper = shallow(<UserDetails userDetails={userDetails} />)
    expect(wrapper.find('.roles').text()).to.equal('ADMIN')
    expect(wrapper.find('.user-list-button')).to.have.length(1)
  })
})
