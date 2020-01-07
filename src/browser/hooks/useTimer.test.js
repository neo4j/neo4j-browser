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
import { render, act } from '@testing-library/react'
import useTimer from './useTimer'

jest.useFakeTimers()

describe('useTimer', () => {
  test('children are revealed after the specified time', () => {
    // Given
    const MyComp = ({ delay, children }) => {
      const show = useTimer(delay)
      return show ? children : null
    }
    const delay = 1000
    const text = 'test text'
    const children = <div>{text}</div>

    // When
    const { queryByText, getByText } = render(
      <MyComp delay={delay}>{children}</MyComp>
    )

    // Then
    expect(queryByText(text)).toBeNull()

    // When moving timer not enough
    act(() => jest.advanceTimersByTime(delay - 1))

    // Then, still nothing
    expect(queryByText(text)).toBeNull()

    // When moving to match the delay
    act(() => jest.advanceTimersByTime(1))

    // Then we should see something
    expect(getByText(text)).not.toBeNull()
  })
})
