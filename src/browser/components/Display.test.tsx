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

import Display from './Display'

describe('<Display>', () => {
  test('hides if condition is false', () => {
    // Given
    const val = false

    // When
    const { container } = render(
      <Display if={val}>
        <span>Hello</span>
      </Display>
    )

    // Then
    expect(container).toMatchSnapshot()
  })
  test('does display if condition is true', () => {
    // Given
    const val = true

    // When
    const { container } = render(
      <Display if={val}>
        <span>Hello</span>
      </Display>
    )

    // Then
    expect(container).toMatchSnapshot()
  })
  test('shows if condition changes from false to true', () => {
    // Given
    let val = false

    // When
    const { container, rerender } = render(
      <Display if={val}>
        <span>Hello</span>
      </Display>
    )

    // Then
    expect(container).toMatchSnapshot()

    // When
    val = true
    rerender(
      <Display if={val}>
        <span>Hello</span>
      </Display>
    )

    // Then
    expect(container).toMatchSnapshot()
  })
  test('hides if condition changes from true to false', () => {
    // Given
    let val = true

    // When
    const { container, rerender } = render(
      <Display if={val}>
        <span>Hello</span>
      </Display>
    )

    // Then
    expect(container).toMatchSnapshot()

    // When
    val = false
    rerender(
      <Display if={val}>
        <span>Hello</span>
      </Display>
    )

    // Then
    expect(container).toMatchSnapshot()
  })
  test('can lazy load if condition changes from false to true and has the lazy prop', () => {
    // Given
    let val = false

    // When
    const { container, rerender } = render(
      <Display if={val} lazy>
        <span>Hello</span>
      </Display>
    )

    // Then
    expect(container).toMatchSnapshot()

    // When
    val = true
    rerender(
      <Display if={val} lazy>
        <span>Hello</span>
      </Display>
    )

    // Then
    expect(container).toMatchSnapshot()
  })
})
