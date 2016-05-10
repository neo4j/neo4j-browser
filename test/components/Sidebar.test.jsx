import React from 'react'
import TestUtils from 'react-addons-test-utils'
import Sidebar from '../../src/components/Sidebar'
import {expect} from 'chai'

const {renderIntoDocument, scryRenderedDOMComponentsWithTag} = TestUtils

describe('Sidebar', () => {
  it('renders a list of navigation links', () => {
    const drawer = null
    const component = renderIntoDocument(<Sidebar openDrawer={drawer} onNavClick={() => {}}/>)
    const items = scryRenderedDOMComponentsWithTag(component, 'li')
    expect(items.length).to.be.above(0)
  })

  it('hides drawer when no drawer should be open', () => {
    const drawer = null
    const component = renderIntoDocument(<Sidebar openDrawer={drawer} onNavClick={() => {}}/>)
    const divs = scryRenderedDOMComponentsWithTag(component, 'div')
    const drawerEl = divs.filter((div) => div.id === 'drawer')
    expect(drawerEl[0].className.split(' ').indexOf('hidden')).to.be.above(-1)
  })

  it('shows drawer when drawer should be open', () => {
    const drawer = 'db'
    const component = renderIntoDocument(<Sidebar openDrawer={drawer} onNavClick={() => {}}/>)
    const divs = scryRenderedDOMComponentsWithTag(component, 'div')
    const drawerEl = divs.filter((div) => div.id === 'drawer')
    expect(drawerEl[0].className.split(' ').indexOf('hidden')).to.be.below(0)
  })
})
