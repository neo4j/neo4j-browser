import React from 'react'
import TestUtils from 'react-addons-test-utils'
import sidebar from '../'
import {expect} from 'chai'

const {renderIntoDocument, scryRenderedDOMComponentsWithTag} = TestUtils

describe('Sidebar', () => {
  it('renders a list of navigation links', () => {
    const drawer = null
    const component = renderIntoDocument(<sidebar.components.Sidebar openDrawer={drawer} onNavClick={() => {}}/>)
    const items = scryRenderedDOMComponentsWithTag(component, 'li')
    expect(items.length).to.be.above(0)
  })

  it('hides drawer when no drawer should be open', () => {
    const drawer = null
    const component = renderIntoDocument(<sidebar.components.Sidebar openDrawer={drawer} onNavClick={() => {}}/>)
    const divs = scryRenderedDOMComponentsWithTag(component, 'div')
    const drawerEl = divs.filter((div) => div.id === 'drawer')
    expect(drawerEl[0].className.split(' ').indexOf('hidden')).to.be.above(-1)
  })

  it('shows drawer when drawer should be open', () => {
    const drawer = 'db'
    const component = renderIntoDocument(<sidebar.components.Sidebar openDrawer={drawer} onNavClick={() => {}}/>)
    const divs = scryRenderedDOMComponentsWithTag(component, 'div')
    const drawerEl = divs.filter((div) => div.id === 'drawer')
    expect(drawerEl[0].className.split(' ').indexOf('hidden')).to.be.below(0)
  })
})
