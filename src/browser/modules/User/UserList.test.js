/*
 * Copyright (c) 2002-2020 "Neo4j,"
 * Neo4j Sweden AB [http://neo4j.com]
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

import { render } from '@testing-library/react'
import React from 'react'
import { createBus } from 'suber'

import { UserList } from './UserList'
import { CYPHER_REQUEST } from 'shared/modules/cypher/cypherDuck'
import {
  listRolesQuery,
  listUsersQuery
} from 'shared/modules/cypher/boltUserHelper'

// Stubbing out title bar as it depends on store
jest.mock('browser/modules/Frame/FrameTitlebar', () => () => null)

describe('<UserList />', () => {
  it('should list users and user roles when enterprise edition is mounted', () => {
    const bus = createBus()
    const useSystemDb = true
    const props = {
      bus,
      frame: {},
      isEnterpriseEdition: true,
      useSystemDb
    }

    const busCallback = jest.fn()
    bus.take(CYPHER_REQUEST, busCallback)

    render(<UserList {...props} />)

    expect(busCallback).toHaveBeenCalledTimes(2)
    expect(busCallback).toHaveBeenCalledWith(
      expect.objectContaining({ query: listRolesQuery(useSystemDb) })
    )
    expect(busCallback).toHaveBeenCalledWith(
      expect.objectContaining({ query: listUsersQuery(useSystemDb) })
    )
  })

  it('should not list users or user roles when non enterprise edition is mounted', () => {
    const bus = createBus()
    const useSystemDb = true
    const props = {
      bus,
      frame: {},
      isEnterpriseEdition: false,
      useSystemDb
    }

    const busCallback = jest.fn()
    bus.take(CYPHER_REQUEST, busCallback)

    render(<UserList {...props} />)

    expect(busCallback).toHaveBeenCalledTimes(0)
  })
})
