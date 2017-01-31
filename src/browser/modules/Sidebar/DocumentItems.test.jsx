/* global test, expect */
import React from 'react'
import { shallow } from 'enzyme'
import { DocumentItems as DocumentItemsComponent } from './DocumentItems'

describe('DocumentItemsComponent', () => {
  const link = {name: 'Link', command: 'url.com', type: 'link'}
  const command = {name: 'Command', command: 'TEST'}

  test('should render href when link is provided', () => {
    const wrapper = shallow(<DocumentItemsComponent items={[link]} />)
    expect(wrapper.find('.command').length).toBe(0)
    expect(wrapper.find('.link').length).toBe(1)
  })
  test('should open href in new tab/window', () => {
    const wrapper = shallow(<DocumentItemsComponent items={[link]} />)
    const renderedLink = wrapper.find('.link')
    expect(renderedLink.find('a').html()).toMatch('target="_blank"')
  })

  test('should render command when no type is provided', () => {
    const wrapper = shallow(<DocumentItemsComponent items={[command]} />)
    expect(wrapper.find('.command').length).toBe(1)
    expect(wrapper.find('.link').length).toBe(0)
  })

  test('should render both link and commands', () => {
    const wrapper = shallow(<DocumentItemsComponent items={[link, command]} />)
    expect(wrapper.find('.command').length).toBe(1)
    expect(wrapper.find('.link').length).toBe(1)
  })
})
