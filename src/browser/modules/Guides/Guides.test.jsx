import React from 'react'

import Guides from './Guides'
import Slide from './Slide'
import {expect} from 'chai'
import {mount} from 'enzyme'

describe('Guides', () => {
  it('should render Guides when html has `slide` tag', () => {
    const html = '<slide>foobar</slide>'
    const wrapper = mount(<Guides html={html} />)
    expect(wrapper.find(Guides)).to.have.length(1)
    expect(wrapper.find(Slide)).to.have.length(1)
  })
  it('should render Guides with multiple slides when html has `slide` tag more than once', () => {
    const html = '<slide>foo</slide><slide>bar</slide>'
    const wrapper = mount(<Guides html={html} />)
    expect(wrapper.find(Guides)).to.have.length(1)
    expect(wrapper.find(Slide)).to.have.length(2)
  })
  it('should render raw html when html has no `slide` tag', () => {
    const html = '<div class="test">Hello</div>'
    const wrapper = mount(<Guides html={html} />)
    expect(wrapper.find(Guides)).to.have.length(1)
    expect(wrapper.find(Slide)).to.have.length(1)
    expect(wrapper.find(Slide).html()).to.contain(html)
  })
})
