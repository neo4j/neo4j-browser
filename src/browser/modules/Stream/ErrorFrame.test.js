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

/* global describe, test, expect */
import React from 'react'
import { render, cleanup } from 'react-testing-library'
import 'jest-dom/extend-expect'
import { ErrorView } from './ErrorFrame'

afterEach(cleanup)

describe('ErrorFrame', () => {
  test('displays UndefinedError if no error specified', async () => {
    // Given
    const { getByText } = render(<ErrorView frame={{}} />)

    // Then
    expect(getByText('UndefinedError')).toBeInTheDocument()
  })
  test('does display an error if info provided', () => {
    // Given
    const { getByText } = render(
      <ErrorView
        frame={{
          error: {
            code: 'Test.Error',
            message: 'Test error description'
          }
        }}
      />
    )

    // Then
    expect(getByText('ERROR')).toBeInTheDocument()
    expect(getByText('Test.Error: Test error description')).toBeInTheDocument()
  })
  test('does display a known error if only code provided', () => {
    // Given
    const { getByText } = render(
      <ErrorView
        frame={{
          error: {
            code: 'UnknownCommandError',
            cmd: ':unknown-command' // Needed to build error msg
          },
          cmd: ':unknown-command'
        }}
      />
    )

    // Then
    expect(getByText('ERROR')).toBeInTheDocument()
    expect(
      getByText('UnknownCommandError: Unknown command :unknown-command')
    ).toBeInTheDocument()
  })
})
