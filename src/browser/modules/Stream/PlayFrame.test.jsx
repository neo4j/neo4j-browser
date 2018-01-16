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
import PlayFrame from './PlayFrame'
import Guides from '../Guides/Guides'

describe('PlayFrame', () => {
  test.skip('should render PlayFrame', () => {
    const wrapper = shallow(<PlayFrame frame={{ cmd: ':play movies' }} />)
    expect(wrapper.find('.playFrame').length).toBe(1)
  })
  test.skip('should render play guide when not guide name is provided', () => {
    const wrapper = shallow(<PlayFrame frame={{ cmd: ':play' }} />)
    expect(wrapper.find('.playFrame').length).toBe(1)
    const card = shallow(wrapper.find('.playFrame').node)
    expect(card.find('.frame-contents').text()).to.match(/not\sspecified/)
  })
  test.skip('should render play guide not found', () => {
    const wrapper = shallow(
      <PlayFrame frame={{ cmd: ':play i-do-not-exist' }} />
    )
    expect(wrapper.find('.playFrame').length).toBe(1)
    const card = shallow(wrapper.find('.playFrame').node)
    expect(card.find('.frame-contents').text()).to.match(/not\sfound/)
  })
  test.skip('should render contents when contents is passed to PlayFrame', () => {
    const wrapper = shallow(<PlayFrame frame={{ result: 'Hello' }} />)
    expect(wrapper.find('.playFrame').length).toBe(1)
    const card = shallow(wrapper.find('.playFrame').node)
    expect(card.find(Guides).props().html).to.eql('Hello')
  })
})
