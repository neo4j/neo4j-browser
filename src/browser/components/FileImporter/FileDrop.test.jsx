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
import { mount } from 'enzyme'
import { FileDrop } from './FileDrop'

describe('FileDrop', () => {
  test('should render child component', () => {
    const ChildComponent = props => {
      return <div className='child' />
    }
    const FileDropComp = FileDrop(ChildComponent, true)
    const wrapper = mount(<FileDropComp />)
    expect(wrapper.find('.child').length).toBe(1)
    wrapper.find('.child').simulate('drop')
  })
})
