/*
 * Copyright (c) "Neo4j"
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

import { ErrorView } from './ErrorFrame'

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
    expect(getByText('Test.Error')).toBeInTheDocument()
    expect(getByText('Test error description')).toBeInTheDocument()
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
    expect(getByText('UnknownCommandError')).toBeInTheDocument()
    expect(getByText('Unknown command :unknown-command')).toBeInTheDocument()
  })
})
