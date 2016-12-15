import React from 'react'

import {Carousel} from './Carousel'
import Slide from './Slide'
import {expect} from 'chai'
import {mount} from 'enzyme'

describe('Carousel', () => {
  it('should render carousel when html has `slide` tag', () => {
    const html = '<slide>foobar</slide>'
    const wrapper = mount(<Carousel html={html} />)
    expect(wrapper.find(Carousel)).to.have.length(1)
    expect(wrapper.find(Slide)).to.have.length(1)
  })
  it('should render carousel with multiple slides when html has `slide` tag more than once', () => {
    const html = '<slide>foo</slide><slide>bar</slide>'
    const wrapper = mount(<Carousel html={html} />)
    expect(wrapper.find(Carousel)).to.have.length(1)
    expect(wrapper.find(Slide)).to.have.length(2)
  })
  it('should render raw html when html has no `slide` tag', () => {
    const html = '<div class="test">Hello</div>'
    const wrapper = mount(<Carousel html={html} />)
    expect(wrapper.find(Carousel)).to.have.length(1)
    expect(wrapper.find(Slide)).to.have.length(1)
    expect(wrapper.find(Slide).html()).to.contain(html)
  })
})
