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
import { DatabaseSelector } from './DatabaseSelector'

const testId = 'database-selection-list'

describe('DatabaseSelector', () => {
  it('renders empty if no databases in list', () => {
    // Given
    const databases = []

    // When
    const { container } = render(<DatabaseSelector databases={databases} />)

    // Then
    expect(container).toMatchInlineSnapshot('<div />')
  })
  it('updates selection in list', () => {
    // Given
    const databases = [
      { name: 'stella', status: 'online' },
      { name: 'molly', status: 'online' }
    ]
    const defaultDb = 'stella'
    let selected = 'stella'

    // When
    const { getByDisplayValue, queryByDisplayValue, rerender } = render(
      <DatabaseSelector
        databases={databases}
        selectedDb={selected}
        defaultDb={defaultDb}
      />
    )

    // Then
    expect(getByDisplayValue(/stella/i)).toBeDefined()
    expect(queryByDisplayValue(/molly/i)).toBeNull()

    // When
    selected = 'molly'
    rerender(
      <DatabaseSelector
        databases={databases}
        selectedDb={selected}
        defaultDb={defaultDb}
      />
    )

    // Then
    expect(getByDisplayValue(/molly/i)).toBeDefined()
    expect(queryByDisplayValue(/stella/i)).toBeNull()

    // When
    selected = ''
    rerender(
      <DatabaseSelector
        databases={databases}
        selectedDb={selected}
        defaultDb={defaultDb}
      />
    )

    // Then default db should be selected
    expect(getByDisplayValue(/select db/i)).toBeDefined()
    expect(queryByDisplayValue(/stella/i)).toBeDefined()
    expect(queryByDisplayValue(/molly/i)).toBeNull()
  })
  it('can handle selections', () => {
    // Given
    const databases = [
      { name: 'stella', status: 'online' },
      { name: 'molly', status: 'online' }
    ]
    const onChange = jest.fn()

    // When
    const { getByTestId } = render(
      <DatabaseSelector databases={databases} onChange={onChange} />
    )
    const select = getByTestId(testId)

    // Select something
    fireEvent.change(select, { target: { value: 'molly' } })

    // Then
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenLastCalledWith('molly')

    // Select something else
    fireEvent.change(select, { target: { value: 'stella' } })

    // Then
    expect(onChange).toHaveBeenCalledTimes(2)
    expect(onChange).toHaveBeenLastCalledWith('stella')
  })
  it('escapes db names when needed', () => {
    // Given
    const databases = [
      { name: 'regulardb', status: 'online' },
      { name: 'db-with-dash', status: 'online' }
    ]
    const onChange = jest.fn()

    // When
    const { getByTestId } = render(
      <DatabaseSelector databases={databases} onChange={onChange} />
    )
    const select = getByTestId(testId)

    // Select something
    fireEvent.change(select, { target: { value: 'regulardb' } })

    // Then
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenLastCalledWith('regulardb')

    // Select something else
    fireEvent.change(select, { target: { value: 'db-with-dash' } })

    // Then
    expect(onChange).toHaveBeenCalledTimes(2)
    expect(onChange).toHaveBeenLastCalledWith('`db-with-dash`')
  })
})
