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

import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import { createBus } from 'suber'
import { QueriesFrame } from './QueriesFrame'
import {
  DISCONNECTED_STATE,
  CONNECTED_STATE
} from 'shared/modules/connections/connectionsDuck'

// eslint-disable-next-line
jest.mock('../../Frame/FrameTemplate', () => ({ contents, statusbar }) => (
  <div>
    {contents}
    {statusbar}
  </div>
))

it('shows error message in statusbar when not connected', () => {
  const props = {
    availableProcedures: ['dbms.listQueries'],
    connectionState: DISCONNECTED_STATE
  }
  const { getByText } = render(<QueriesFrame {...props} />)

  expect(getByText(/Unable to connect to bolt server/i)).not.toBeNull()
})

it('can list and kill queries', () => {
  const bus = createBus()
  bus.self = jest
    .fn()
    .mockImplementationOnce((type, fn, cb) =>
      cb({
        success: true,
        result: {
          records: [
            {
              keys: ['query'],
              _fields: ['TEST RETURN'],
              host: 'testhost.test',
              error: undefined
            }
          ]
        }
      })
    )
    .mockImplementationOnce((type, fn, cb) =>
      cb({
        success: true
      })
    )
    .mockImplementationOnce((type, fn, cb) => {
      // Do not call here to let react render the
      // killed state update before adding the new queries
    })

  const props = {
    availableProcedures: ['dbms.listQueries'],
    connectionState: CONNECTED_STATE,
    bus,
    neo4jVersion: '4.0.0'
  }

  const { getByText, getByTestId } = render(<QueriesFrame {...props} />)

  // Check that it's listed
  expect(getByText('neo4j://testhost.test')).not.toBeNull()
  expect(getByText('TEST RETURN')).not.toBeNull()

  // When
  // Kill query
  fireEvent.click(getByTestId('confirmation-button-initial'))
  fireEvent.click(getByTestId('confirmation-button-confirm'))

  expect(getByText(/Query successfully cancelled/i)).not.toBeNull()
})
