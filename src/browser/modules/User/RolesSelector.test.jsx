/* global test, expect */
import React from 'react'
import RolesSelector from './RolesSelector'
import { shallow } from 'enzyme'

describe('RolesSelector', () => {
  test('should return component when roles are avaiable', () => {
    const wrapper = shallow(<RolesSelector roles={['1', '2']} />)
    expect(wrapper.find('option').length).toBe(2)
    expect(wrapper.find('option').first().text()).toBe('1')
    expect(wrapper.find('option').at(1).text()).toBe('2')
  })
  test('should not return component when roles are unavaiable', () => {
    const wrapper = shallow(<RolesSelector roles={[]} />)
    expect(wrapper.type()).toBe(null)
  })
})
