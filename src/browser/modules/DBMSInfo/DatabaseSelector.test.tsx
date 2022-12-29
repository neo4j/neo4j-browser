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
import { fireEvent, render } from '@testing-library/react'
import React from 'react'

import { DatabaseSelector } from './DatabaseSelector'
import { Database } from 'shared/modules/dbMeta/dbMetaDuck'

const testId = 'database-selection-list'

const createDummyDb = (name: string, status = 'online'): Database => ({
  name,
  status,
  address: 'bolt',
  currentStatus: 'online',
  default: false,
  error: '',
  requestedStatus: '',
  role: 'LEADER',
  aliases: [],
  home: false
})

describe('DatabaseSelector', () => {
  it('renders empty if no databases in list', () => {
    // Given
    const databases: Database[] = []

    // When
    const { container } = render(<DatabaseSelector databases={databases} />)

    // Then
    expect(container).toMatchInlineSnapshot('<div />')
  })
  it('updates selection in list', () => {
    // Given
    const databases = ['stella', 'molly'].map(n => createDummyDb(n))
    let selected = 'stella'

    // When
    const { getByDisplayValue, queryByDisplayValue, rerender } = render(
      <DatabaseSelector databases={databases} selectedDb={selected} />
    )

    // Then
    expect(getByDisplayValue(/stella/i)).toBeDefined()
    expect(queryByDisplayValue(/molly/i)).toBeNull()

    // When
    selected = 'molly'
    rerender(<DatabaseSelector databases={databases} selectedDb={selected} />)

    // Then
    expect(getByDisplayValue(/molly/i)).toBeDefined()
    expect(queryByDisplayValue(/stella/i)).toBeNull()

    // When
    selected = ''
    rerender(<DatabaseSelector databases={databases} selectedDb={selected} />)

    // Then select db text should be shown
    expect(getByDisplayValue(/select db/i)).toBeDefined()
    expect(queryByDisplayValue(/stella/i)).toBeDefined()
    expect(queryByDisplayValue(/molly/i)).toBeNull()
  })
  it('can handle selections', () => {
    // Given
    const databases = ['stella', 'molly'].map(n => createDummyDb(n))
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
    const databases = ['regulardb', 'db-with-dash'].map(n => createDummyDb(n))
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
