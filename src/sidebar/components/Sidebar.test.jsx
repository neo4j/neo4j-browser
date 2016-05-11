import React from 'react'
import sidebar from '../'
import { expect } from 'chai'
import { shallow } from 'enzyme'

describe('Sidebar', () => {
  it('renders a list of navigation links', () => {
    const drawer = null
    const wrapper = shallow(<sidebar.components.Sidebar openDrawer={drawer} onNavClick={() => {}}/>)
    expect(wrapper.find('li').length).to.be.above(0)
  })

  it('hides drawer when no drawer should be open', () => {
    const drawer = null
    const wrapper = shallow(<sidebar.components.Sidebar openDrawer={drawer} onNavClick={() => {}}/>)
    expect(wrapper.find('#drawer').hasClass('hidden')).to.equal(true)
  })

  it('shows drawer when drawer should be open', () => {
    const drawer = 'db'
    const wrapper = shallow(<sidebar.components.Sidebar openDrawer={drawer} onNavClick={() => {}}/>)
    expect(wrapper.find('#drawer').hasClass('hidden')).to.equal(false)
  })
})
