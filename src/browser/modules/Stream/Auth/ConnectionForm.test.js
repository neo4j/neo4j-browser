/*
 * Copyright (c) 2002-2019 "Neo4j,"
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
import { render, fireEvent } from 'react-testing-library'
import { ConnectionForm } from './ConnectionForm'

/* global jest */

test('should print correct state for retaining credentials', async () => {
  const bus = {
    //  eslint-disable-next-line
    self: jest.fn((x, y, cb) => cb({ success: true }))
  }
  const updateConnection = jest.fn()
  const setActiveConnection = jest.fn()
  const executeInitCmd = jest.fn()
  const host = 'my-host'
  const username = 'my-username'
  let storeCredentials = true // initial default value
  let activeConnectionData = null
  let activeConnection = null
  let frame = {}
  const error = jest.fn()

  // When
  const { rerender, getByText, getByTestId } = render(
    <ConnectionForm
      frame={frame}
      error={error}
      bus={bus}
      activeConnectionData={activeConnectionData}
      activeConnection={activeConnection}
      storeCredentials={storeCredentials}
      updateConnection={updateConnection}
      setActiveConnection={setActiveConnection}
      executeInitCmd={executeInitCmd}
    />
  )

  // Then form should be there
  expect(getByText(/connect url/i)).toBeDefined()

  // Fill form and click connect
  fireEvent.change(getByTestId('boltaddress'), { target: { value: host } })
  fireEvent.change(getByTestId('username'), { target: { value: username } })
  fireEvent.change(getByTestId('password'), { target: { value: 'xxx' } })
  fireEvent.click(getByTestId('connect'))

  // When faking propagation
  activeConnection = true
  activeConnectionData = {
    username,
    host
  }
  rerender(
    <ConnectionForm
      frame={frame}
      bus={bus}
      activeConnectionData={activeConnectionData}
      activeConnection={activeConnection}
      storeCredentials={storeCredentials}
      updateConnection={updateConnection}
      setActiveConnection={setActiveConnection}
      executeInitCmd={executeInitCmd}
    />
  )

  // Then
  expect(getByText(/my-username/i)).toBeDefined()
  expect(getByText(/bolt:\/\/my-host/i)).toBeDefined()
  expect(
    getByText(/Connection credentials are\sstored in your web browser./i)
  ).toBeDefined()

  // When not storing credentials anymore
  storeCredentials = false
  rerender(
    <ConnectionForm
      frame={frame}
      bus={bus}
      activeConnectionData={activeConnectionData}
      activeConnection={activeConnection}
      storeCredentials={storeCredentials}
      updateConnection={updateConnection}
      setActiveConnection={setActiveConnection}
      executeInitCmd={executeInitCmd}
    />
  )

  // Then
  expect(getByText(/my-username/i)).toBeDefined()
  expect(getByText(/bolt:\/\/my-host/i)).toBeDefined()
  expect(
    getByText(/Connection credentials are\snot\sstored in your web browser./i)
  ).toBeDefined()
})
