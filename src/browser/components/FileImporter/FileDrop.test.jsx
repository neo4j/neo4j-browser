import React from 'react'
import { mount } from 'enzyme'
import chai from 'chai'
import chaiEnzyme from 'chai-enzyme'
import spies from 'chai-spies'
import {FileDrop} from './FileDrop'

describe('FileDrop', () => {
  const expect = chai.expect
  chai.use(spies)
  chai.use(chaiEnzyme())
  it('should render child component', () => {
    const ChildComponent = (props) => {
      return (<div className='child' />)
    }
    const FileDropComp = FileDrop(ChildComponent, true)
    const wrapper = mount(<FileDropComp />)
    expect(wrapper.find('.child')).to.have.length(1)
    console.log(wrapper.find('.child').get(0))
    wrapper.find('.child').simulate('drop')
  })
})
