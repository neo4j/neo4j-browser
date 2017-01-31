/* global test, expect */
import React from 'react'
import { mount } from 'enzyme'
import {FileDrop} from './FileDrop'

describe('FileDrop', () => {
  test('should render child component', () => {
    const ChildComponent = (props) => {
      return (<div className='child' />)
    }
    const FileDropComp = FileDrop(ChildComponent, true)
    const wrapper = mount(<FileDropComp />)
    expect(wrapper.find('.child').length).toBe(1)
    wrapper.find('.child').simulate('drop')
  })
})
