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
import { UserDetails } from './UserDetails'
import { shallow } from 'enzyme'

describe('connected as', () => {
  test('should not show user details if not connected', () => {
    const userDetails = null
    const wrapper = shallow(<UserDetails userDetails={userDetails} />)
    expect(wrapper.find('.user-details').length).toBe(0)
  })
  test('should show username when connected', () => {
    const userDetails = {
      username: 'test',
      roles: []
    }
    const wrapper = shallow(<UserDetails userDetails={userDetails} />)
    expect(wrapper.find('.user-details').length).toBeGreaterThan(0)
    expect(wrapper.find('.username').text()).toEqual('test')
    expect(wrapper.find('.roles').text()).toEqual('-')
  })
  test('should show user role when connected', () => {
    const userDetails = {
      username: 'any',
      roles: ['ADMIN', 'READER']
    }
    const wrapper = shallow(<UserDetails userDetails={userDetails} />)
    expect(wrapper.find('.roles').text()).toEqual('ADMIN, READER')
  })
  test('not should display admin functions when user is not assigned the "admin" role', () => {
    const userDetails = {
      username: 'any',
      roles: ['READER']
    }
    const wrapper = shallow(<UserDetails userDetails={userDetails} />)
    expect(wrapper.find('.roles').text()).toEqual('READER')
    expect(wrapper.find('.user-list-button').length).toBe(0)
  })
  test('should display admin functions when user is assigned the "admin" role', () => {
    const userDetails = {
      username: 'any',
      roles: ['ADMIN']
    }
    const wrapper = shallow(<UserDetails userDetails={userDetails} />)
    expect(wrapper.find('.roles').text()).toEqual('ADMIN')
    expect(wrapper.find('.user-list-button').length).toBe(1)
  })
})
