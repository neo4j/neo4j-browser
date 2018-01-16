/*
 * Copyright (c) 2002-2018 "Neo4j, Inc"
 * Network Engine for Objects in Lund AB [http://neotechnology.com]
 *
 * This file is part of Neo4j.
 *
 * Neo4j is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/* global test, expect */
import React from 'react'
import Navigation from './Navigation'
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
  const navItems = [
    { name: navItem1, icon: null, content: Tab1Content },
    { name: navItem2, icon: null, content: Tab2Content }
  ]

  test('renders a list of navigation links', () => {
    const wrapper = mount(<Navigation topNavItems={navItems} />)
    expect(wrapper.find('div').length).toBeGreaterThan(0)
  })

  test('hides drawer when no drawer should be open', () => {
    const drawer = null
    const wrapper = mount(
      <Navigation openDrawer={drawer} topNavItems={navItems} />
    )
    expect(
      wrapper
        .find('.tab')
        .at(0)
        .hasClass('hidden')
    ).toEqual(true)
  })

  test('shows drawer when drawer should be open', () => {
    const drawer = navItem1
    const wrapper = mount(
      <Navigation openDrawer={drawer} topNavItems={navItems} />
    )
    expect(
      wrapper
        .find('.tab')
        .at(0)
        .hasClass('hidden')
    ).toEqual(false)
  })

  test('should render the selected tab', () => {
    const drawer = navItem1
    const wrapper = mount(
      <Navigation openDrawer={drawer} topNavItems={navItems} />
    )
    expect(
      wrapper
        .find('.tab')
        .at(0)
        .hasClass('hidden')
    ).toEqual(false)
    expect(wrapper.find('#thing').length).toBe(1)
    expect(wrapper.find('#thing2').length).toBe(0)
  })
})
