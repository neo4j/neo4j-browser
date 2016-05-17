import React from 'react'
import { shallow } from 'enzyme'
import {PlayFrame} from './PlayFrame'
import {expect} from 'chai'
import { spys } from 'chai-spy'

describe('PlayFrame', () => {
  it('should render PlayFrame', () => {
    const content = '<div class="playFrame frame">abc</div>'
    const wrapper = shallow(<PlayFrame content={content} command={'play abc'}/>)
    expect(wrapper.find('.playFrame')).to.have.length(1)
    expect(wrapper.find('.playFrame').html()).to.equal(content)
  })
  it('should render play guide not found', () => {
    const content = '<div class="playFrame frame">Guide not found</div>'
    const wrapper = shallow(<PlayFrame content={content} command={'play'} />)
    expect(wrapper.find('.playFrame')).to.have.length(1)
    expect(wrapper.find('.playFrame').html()).to.equal(content)
  })
})
