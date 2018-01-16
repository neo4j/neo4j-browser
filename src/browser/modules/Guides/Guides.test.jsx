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

import Guides from './Guides'
import Slide from './Slide'

import { mount } from 'enzyme'

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
