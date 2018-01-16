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
import { UserAdd } from './UserAdd'
import { shallow } from 'enzyme'

const mockBus = { self: () => {} }

describe('UserAdd', () => {
  test('should show filtered list of roles', () => {
    const user = { username: 'user', roles: ['a', 'b'], status: [] }
    const wrapper = shallow(
      <UserAdd
        bus={mockBus}
        username={user.username}
        availableRoles={['a', 'b', 'c']}
        roles={user.roles}
        status={user.status}
      />
    )
    expect(wrapper.instance().availableRoles()).toEqual(['c'])
    expect(wrapper.state().roles).toEqual(['a', 'b'])
  })
  test('should remove role from the users assigned roles', () => {
    const user = { username: 'user', roles: ['a', 'b', 'c'], status: [] }
    const wrapper = shallow(
      <UserAdd
        bus={mockBus}
        username={user.username}
        availableRoles={user.roles}
        roles={user.roles}
        status={user.status}
      />
    )
    expect(wrapper.instance().removeRole('a')).toEqual(['b', 'c'])
  })
})
