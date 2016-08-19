import React from 'react'
import Slide from './Slide'
import {expect} from 'chai'
import {mount} from 'enzyme'

describe('Slide', () => {
  it('should render html', () => {
    const html = '<h1>foobar</h1>'
    const wrapper = mount(<Slide html={html}/>)
    expect(wrapper.find(Slide).html()).to.contain(html)
  })
})
