/* global test, expect */
import React from 'react'
import { DatabaseKernelInfo } from './DatabaseKernelInfo'
import { shallow } from 'enzyme'

describe('connected as', () => {
  test('should not show database kernal info if not connected', () => {
    const databaseKernelInfo = null
    const wrapper = shallow(<DatabaseKernelInfo databaseKernelInfo={databaseKernelInfo} />)
    expect(wrapper.find('.database-kernel-info').length).toBe(0)
  })
  test('should show verion and edition when connected', () => {
    const databaseKernelInfo = {
      version: 'test',
      edition: ['3.1.0']
    }
    const wrapper = shallow(<DatabaseKernelInfo databaseKernelInfo={databaseKernelInfo} />)
    expect(wrapper.find('.database-kernel-info').length).toBeGreaterThan(0)
    expect(wrapper.find('.version').text()).toEqual('test')
    expect(wrapper.find('.edition').text()).toEqual('3.1.0')
  })
})
