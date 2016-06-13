import React from 'react'
import { shallow } from 'enzyme'
import {PlayFrame} from './PlayFrame'
import chai from 'chai'
import guides from '../../../guides'

const expect = chai.expect

describe('PlayFrame', () => {
  it('should render PlayFrame', () => {
    const wrapper = shallow(<PlayFrame frame={{cmd: ':play movies'}}/>)
    expect(wrapper.find('.playFrame')).to.have.length(1)
  })
  it('should render play guide when not guide name is provided', () => {
    const wrapper = shallow(<PlayFrame frame={{cmd: ':play'}} />)
    expect(wrapper.find('.playFrame')).to.have.length(1)
    expect(wrapper.find('.playFrame').find('.frame-contents').text()).to.match(/not\sspecified/)
  })
  it('should render play guide not found', () => {
    const wrapper = shallow(<PlayFrame frame={{cmd: ':play i-do-not-exist'}} />)
    expect(wrapper.find('.playFrame')).to.have.length(1)
    expect(wrapper.find('.playFrame').find('.frame-contents').text()).to.match(/not\sfound/)
  })
  it('should render contents when contents is passed to PlayFrame', () => {
    const wrapper = shallow(<PlayFrame frame={{contents: 'Hello'}} />)
    expect(wrapper.find('.playFrame')).to.have.length(1)
    const slide = wrapper.find('.playFrame').find('.frame-contents').find(guides.components.Slide).shallow({html: 'Hello'})
    expect(slide.html()).to.match(/Hello/)
  })

  it('should render contents when contents and command are passed to PlayFrame', () => {
    const wrapper = shallow(<PlayFrame frame={{cmd: ':play movies', contents: 'Hello'}} />)
    expect(wrapper.find('.playFrame')).to.have.length(1)
    const slide = wrapper.find('.playFrame').find('.frame-contents').find(guides.components.Slide).shallow({html: 'Hello'})
    expect(slide.html()).to.match(/Hello/)
  })
})
