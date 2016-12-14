import React from 'react'
import Navigation from './Navigation'
import { expect } from 'chai'
import { mount } from 'enzyme'

describe('Navigation', () => {
  const Tab1Content = () => {
    return <div id='thing' />
  }
  const Tab2Content = () => {
    return <div id='thing2' />
  }
  const navItem1 = 'item1' + Math.random()
  const navItem2 = 'item2' + Math.random()
  const navItems = [{name: navItem1, icon: '', content: Tab1Content}, {name: navItem2, icon: '', content: Tab2Content}]

  it('renders a list of navigation links', () => {
    const wrapper = mount(<Navigation onNavClick={() => {}} topNavItems={navItems} />)
    expect(wrapper.find('div').length).to.be.above(0)
  })

  it('hides drawer when no drawer should be open', () => {
    const drawer = null
    const wrapper = mount(<Navigation openDrawer={drawer} onNavClick={() => {}} topNavItems={navItems} />)
    expect(wrapper.find('.tab').at(0).hasClass('hidden')).to.equal(true)
  })

  it('shows drawer when drawer should be open', () => {
    const drawer = navItem1
    const wrapper = mount(<Navigation openDrawer={drawer} onNavClick={() => {}} topNavItems={navItems} />)
    expect(wrapper.find('.tab').at(0).hasClass('hidden')).to.equal(false)
  })

  it('should render the selected tab', () => {
    const drawer = navItem1
    const wrapper = mount(<Navigation openDrawer={drawer} onNavClick={() => {}} topNavItems={navItems} />)
    expect(wrapper.find('.tab').at(0).hasClass('hidden')).to.equal(false)
    expect(wrapper.find('#thing')).has.length(1)
    expect(wrapper.find('#thing2')).has.length(0)
  })
})
