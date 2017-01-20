import React from 'react'
import { DatabaseKernelInfo } from './DatabaseKernelInfo'
import { expect } from 'chai'
import { shallow } from 'enzyme'

describe('connected as', () => {
  it('should not show database kernal info if not connected', () => {
    const databaseKernelInfo = null
    const wrapper = shallow(<DatabaseKernelInfo databaseKernelInfo={databaseKernelInfo} />)
    expect(wrapper.find('.database-kernel-info')).to.have.length(0)
  })
  it('should show verion and edition when connected', () => {
    const databaseKernelInfo = {
      version: 'test',
      edition: ['3.1.0']
    }
    const wrapper = shallow(<DatabaseKernelInfo databaseKernelInfo={databaseKernelInfo} />)
    expect(wrapper.find('.database-kernel-info')).to.not.have.length(0)
    expect(wrapper.find('.version').text()).to.equal('test')
    expect(wrapper.find('.edition').text()).to.equal('3.1.0')
  })
})
