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
import { UserInformation } from './UserInformation'
import { shallow } from 'enzyme'

const mockBus = { self: () => {} }

describe('UserInformation', () => {
  test('should show username and role of a user', () => {
    const user = { username: 'user', roles: ['roles'], status: [] }
    const wrapper = shallow(
      <UserInformation
        bus={mockBus}
        username={user.username}
        roles={user.roles}
        status={user.status}
      />
    )
    expect(wrapper.find('.user-info').length).toBe(1)
    expect(wrapper.find('.user-info .username').text()).toMatch(user.username)
    expect(
      wrapper
        .find('.roles')
        .first()
        .html()
    ).toMatch(user.roles[0])
  })
})
