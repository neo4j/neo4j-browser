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
import { render } from '@testing-library/react'

import { ServerSwitchFrame } from './ServerSwitchFrame'

test('shows successful message if connection was successful', () => {
  // Given
  const frame = {
    type: 'switch-success',
    activeConnectionData: { host: 'test-host', username: 'test-username' },
    storeCredentials: true
  }
  const activeConnectionData = { authEnabled: true }

  // When
  const { getByText } = render(
    <ServerSwitchFrame
      frame={frame}
      activeConnectionData={activeConnectionData}
    />
  )

  // Then
  expect(getByText(frame.activeConnectionData.host)).not.toBe(null)
  expect(getByText(frame.activeConnectionData.username)).not.toBe(null)
  expect(getByText(/credentials are\s*stored/)).not.toBe(null)
  expect(getByText(/You have switched connection/i)).not.toBe(null)
})

test('shows unsuccessful message if connection was unsuccessful', () => {
  // Given
  const frame = {
    type: 'switch-fail',
    activeConnectionData: { host: 'test-host', username: 'test-username' },
    storeCredentials: true
  }
  const activeConnectionData = { authEnabled: true }

  // When
  const { getByText, queryByText } = render(
    <ServerSwitchFrame
      frame={frame}
      activeConnectionData={activeConnectionData}
    />
  )

  // Then
  expect(getByText(/Connection failed/i)).not.toBe(null)
  expect(getByText(/:server connect/i)).not.toBe(null)
  expect(queryByText(frame.activeConnectionData.host)).toBe(null)
  expect(queryByText(frame.activeConnectionData.username)).toBe(null)
  expect(queryByText(/credentials are\s*stored/i)).toBe(null)
})
