/* global test, expect */
import React from 'react'
import Slide from './Slide'

import {mount} from 'enzyme'

describe('Slide', () => {
  test('should render html', () => {
    const html = '<h1>foobar</h1>'
    const wrapper = mount(<Slide html={html} />)
    expect(wrapper.find(Slide).html()).toMatch(html)
  })
})
