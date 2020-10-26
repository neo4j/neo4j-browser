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

import { ServerStatusFrame } from './ServerStatusFrame'

test("shows friendly message on how to connect if you're not connected (empty data)", () => {
  // Given
  const props = {}

  // When
  const { getByText } = render(<ServerStatusFrame {...props} />)

  // Then
  expect(getByText(/You are currently not connected to Neo4j/i)).not.toBe(null)
})

test("shows friendly message on how to connect if you're not connected (populated data)", () => {
  // Given
  const props = {
    activeConnectionData: {
      host: 'test-host',
      username: 'test-username',
      authEnabled: true
    }, // Data not wiped out since last connect
    storeCredentials: true,
    isConnected: false
  }

  // When
  const { getByText } = render(<ServerStatusFrame {...props} />)

  // Then
  expect(getByText(/You are currently not connected to Neo4j/i)).not.toBe(null)
})

test('shows connection info when connected (retain creds)', () => {
  // Given
  const props = {
    activeConnectionData: {
      host: 'test-host',
      username: 'test-username',
      authEnabled: true
    },
    storeCredentials: true,
    isConnected: true
  }

  // When
  const { getByText } = render(<ServerStatusFrame {...props} />)

  // Then
  expect(getByText(/test-username/i)).not.toBe(null)
  expect(getByText(/test-host/i)).not.toBe(null)
  expect(
    getByText(/Connection credentials are\s*stored in your web browser./i)
  ).not.toBe(null)
})

test('shows connection info when connected (no retain creds)', () => {
  // Given
  const props = {
    activeConnectionData: {
      host: 'test-host',
      username: 'test-username',
      authEnabled: true
    },
    storeCredentials: false,
    isConnected: true
  }

  // When
  const { getByText } = render(<ServerStatusFrame {...props} />)

  // Then
  expect(getByText(/test-username/i)).not.toBe(null)
  expect(getByText(/test-host/i)).not.toBe(null)
  expect(
    getByText(/Connection credentials are\s*not\s*stored in your web browser./i)
  ).not.toBe(null)
})
