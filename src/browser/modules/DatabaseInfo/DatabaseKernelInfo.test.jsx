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
import { DatabaseKernelInfo } from './DatabaseKernelInfo'
import { shallow } from 'enzyme'

describe('connected as', () => {
  test('should not show database kernel info if not connected', () => {
    const databaseKernelInfo = null
    const wrapper = shallow(
      <DatabaseKernelInfo databaseKernelInfo={databaseKernelInfo} />
    )
    expect(wrapper.find('.database-kernel-info').length).toBe(0)
  })
  test('should show verion and edition when connected', () => {
    const databaseKernelInfo = {
      version: 'test',
      edition: ['3.1.0']
    }
    const wrapper = shallow(
      <DatabaseKernelInfo databaseKernelInfo={databaseKernelInfo} />
    )
    expect(wrapper.find('.database-kernel-info').length).toBeGreaterThan(0)
    expect(wrapper.find('.version').text()).toEqual('test')
    expect(wrapper.find('.edition').text()).toEqual('3.1.0')
  })
})
