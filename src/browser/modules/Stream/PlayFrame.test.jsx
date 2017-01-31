/* global test, expect */
import React from 'react'
import { shallow } from 'enzyme'
import PlayFrame from './PlayFrame'
import Guides from '../Guides/Guides'

describe('PlayFrame', () => {
  test.skip('should render PlayFrame', () => {
    const wrapper = shallow(<PlayFrame frame={{cmd: ':play movies'}} />)
    expect(wrapper.find('.playFrame').length).toBe(1)
  })
  test.skip('should render play guide when not guide name is provided', () => {
    const wrapper = shallow(<PlayFrame frame={{cmd: ':play'}} />)
    expect(wrapper.find('.playFrame').length).toBe(1)
    const card = shallow(wrapper.find('.playFrame').node)
    expect(card.find('.frame-contents').text()).to.match(/not\sspecified/)
  })
  test.skip('should render play guide not found', () => {
    const wrapper = shallow(<PlayFrame frame={{cmd: ':play i-do-not-exist'}} />)
    expect(wrapper.find('.playFrame').length).toBe(1)
    const card = shallow(wrapper.find('.playFrame').node)
    expect(card.find('.frame-contents').text()).to.match(/not\sfound/)
  })
  test.skip('should render contents when contents is passed to PlayFrame', () => {
    const wrapper = shallow(<PlayFrame frame={{result: 'Hello'}} />)
    expect(wrapper.find('.playFrame').length).toBe(1)
    const card = shallow(wrapper.find('.playFrame').node)
    expect(card.find(Guides).props().html).to.eql('Hello')
  })
})
