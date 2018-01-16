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
import { shallow } from 'enzyme'
import { DocumentItems as DocumentItemsComponent } from './DocumentItems'

describe('DocumentItemsComponent', () => {
  const link = { name: 'Link', command: 'url.com', type: 'link' }
  const command = { name: 'Command', command: 'TEST' }

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
