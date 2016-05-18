import React from 'react'
import { shallow } from 'enzyme'
import {PlayFrame} from './PlayFrame'
import {expect} from 'chai'

describe('PlayFrame', () => {
  it('should render PlayFrame', () => {
    const wrapper = shallow(<PlayFrame command={':play movies'}/>)
    expect(wrapper.find('.playFrame')).to.have.length(1)
  })
  it('should render play guide when not guide name is provided', () => {
    const content = '<div class="playFrame frame">Play guide not specified</div>'
    const wrapper = shallow(<PlayFrame command={':play'} />)
    expect(wrapper.find('.playFrame')).to.have.length(1)
    expect(wrapper.find('.playFrame').html()).to.equal(content)
  })
  it('should render play guide not found', () => {
    const content = '<div class="playFrame frame">Guide not found</div>'
    const wrapper = shallow(<PlayFrame command={':play i-do-not-exist'} />)
    expect(wrapper.find('.playFrame')).to.have.length(1)
    expect(wrapper.find('.playFrame').html()).to.equal(content)
  })
})
