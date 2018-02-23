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

import { UserList } from './UserList'

const mockBus = { self: () => {} }

describe('UserList', () => {
  test('should show list of database users by username', () => {
    const props = {
      users: [['Admin', ['admin'], []], ['Thing', ['thing'], []]]
    }
    const wrapper = shallow(
      shallow(<UserList bus={mockBus} {...props} />).props().contents
    )
    expect(wrapper.find('.user-information').length).toBe(2)
  })

  test.skip('should show list of database users by role', () => {
    const roles = ['user1', 'user2']
    const props = { roles: roles }
    const wrapper = shallow(
      shallow(<UserList bus={mockBus} {...props} />).contents
    )
    expect(wrapper.find('.roles').text()).toEqual('user1, user2')
  })
})
