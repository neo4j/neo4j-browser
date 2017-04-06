/* global test, expect */
import React from 'react'

import Guides from './Guides'
import Slide from './Slide'

import {mount} from 'enzyme'

describe('Guides', () => {
  test('should render Guides when html has `slide` tag', () => {
    const html = '<slide>foobar</slide>'
    const wrapper = mount(<Guides html={html} />)
    expect(wrapper.find(Guides).length).toBe(1)
    expect(wrapper.find(Slide).length).toBe(1)
  })
  test('should render Guides with multiple slides when html has `slide` tag more than once', () => {
    const html = '<slide>foo</slide><slide>bar</slide>'
    const wrapper = mount(<Guides html={html} />)
    expect(wrapper.find(Guides).length).toBe(1)
    expect(wrapper.find(Slide).length).toBe(2)
  })
  test('should render raw html when html has no `slide` tag', () => {
    const html = '<div class="test">Hello</div>'
    const wrapper = mount(<Guides html={html} />)
    expect(wrapper.find(Guides).length).toBe(1)
    expect(wrapper.find(Slide).length).toBe(1)
    expect(wrapper.find(Slide).html()).toMatch(html)
  })
})
