import React from 'react'
import { expect } from 'chai'
import { shallow } from 'enzyme'
import { DocumentItems } from './DocumentItems'

describe('DocumentItems', () => {
  const link = {name: 'Link', command: 'url.com', type: 'link'}
  const command = {name: 'Command', command: 'TEST'}

  it('should render href when link is provided', () => {
    const wrapper = shallow(<DocumentItems items={[link]}/>)
    expect(wrapper.find('.command')).has.length(0)
    expect(wrapper.find('.link')).has.length(1)
  })
  it('should open href in new tab/window', () => {
    const wrapper = shallow(<DocumentItems items={[link]}/>)
    const renderedLink = wrapper.find('.link')
    console.log(renderedLink)

    expect(renderedLink.html()).to.contain('target="_blank"')
  })

  it('should render command when no type is provided', () => {
    const wrapper = shallow(<DocumentItems items={[command]}/>)
    expect(wrapper.find('.command')).has.length(1)
    expect(wrapper.find('.link')).has.length(0)
  })

  it('should render both link and commands', () => {
    const wrapper = shallow(<DocumentItems items={[link, command]}/>)
    expect(wrapper.find('.command')).has.length(1)
    expect(wrapper.find('.link')).has.length(1)
  })
})
