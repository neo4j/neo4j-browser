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

/* global jest, describe, test, expect */

import React from 'react'
import { render, fireEvent } from 'react-testing-library'
import { DatabaseSelector } from './DatabaseSelector'

const testId = 'database-selection-list'

describe('DatabaseSelector', () => {
  it('renders empty if no databases in list', () => {
    // Given
    const databases = []

    // When
    const { container } = render(<DatabaseSelector databases={databases} />)

    // Then
    expect(container).toMatchInlineSnapshot(`<div />`)
  })
  it('updates selection in list', () => {
    // Given
    const databases = ['stella', 'molly']
    let selected = 'stella'

    // When
    const { getByDisplayValue, queryByDisplayValue, rerender } = render(
      <DatabaseSelector databases={databases} selected={selected} />
    )

    // Then
    expect(getByDisplayValue('stella')).toBeDefined()
    expect(queryByDisplayValue('molly')).toBeNull()

    // When
    selected = 'molly'
    rerender(<DatabaseSelector databases={databases} selected={selected} />)

    // Then
    expect(getByDisplayValue('molly')).toBeDefined()
    expect(queryByDisplayValue('stella')).toBeNull()

    // When
    selected = ''
    rerender(<DatabaseSelector databases={databases} selected={selected} />)

    // Then
    expect(getByDisplayValue(/choose/i)).toBeDefined()
    expect(queryByDisplayValue('molly')).toBeNull()
    expect(queryByDisplayValue('stella')).toBeNull()
  })
  it('can handle selections', () => {
    // Given
    const databases = ['stella', 'molly']
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
})
