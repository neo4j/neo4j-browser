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

import { createBus } from 'suber'

import { ClickToCode } from './index'
import { SET_CONTENT } from 'shared/modules/editor/editorDuck'

describe('ClickToCode', () => {
  let bus
  beforeEach(() => {
    bus = createBus()
  })
  afterEach(() => {
    bus.reset()
  })
  test('does not render if no children', () => {
    // Given
    const myFn = jest.fn()
    const MyComp = () => <span>yo!</span>

    // When
    bus.take(SET_CONTENT, myFn)
    const { container } = render(
      <ClickToCode CodeComponent={MyComp} bus={bus} />
    )

    // Then
    expect(container).toMatchSnapshot()
    expect(myFn).toHaveBeenCalledTimes(0)
  })
  test('renders if no CodeComponent is provided', () => {
    // Given
    const myFn = jest.fn()

    // When
    bus.take(SET_CONTENT, myFn)
    const { container } = render(<ClickToCode bus={bus} />)

    // Then
    expect(container).toMatchSnapshot()
    expect(myFn).toHaveBeenCalledTimes(0)
  })
  test('renders code as the code when code is available', () => {
    // Given
    const myFn = jest.fn()
    const code = 'my code'

    // When
    bus.take(SET_CONTENT, myFn)
    const { container, getByText } = render(
      <ClickToCode code={code} bus={bus}>
        hello
      </ClickToCode>
    )

    // Then
    expect(container).toMatchSnapshot()
    expect(myFn).toHaveBeenCalledTimes(0)

    // When
    fireEvent.click(getByText('hello'))

    // Then
    expect(myFn).toHaveBeenCalledTimes(1)
    expect(myFn).toHaveBeenCalledWith({ message: code, type: SET_CONTENT })
  })
  test('renders children as code if no code is provided', () => {
    // Given
    const myFn = jest.fn()
    const childrenString = 'hellohi!'

    // When
    bus.take(SET_CONTENT, myFn)
    const { container, getByText } = render(
      <ClickToCode bus={bus}>hellohi!</ClickToCode>
    )

    // Then
    expect(container).toMatchSnapshot()
    expect(myFn).toHaveBeenCalledTimes(0)

    // When
    fireEvent.click(getByText(childrenString))

    // Then
    expect(myFn).toHaveBeenCalledTimes(1)
    expect(myFn).toHaveBeenCalledWith({
      message: childrenString,
      type: SET_CONTENT
    })
  })
  test('renders all children', () => {
    // Given
    const code = 'my code'
    const myFn = jest.fn()
    const children = (
      <div>
        <span>hello</span>
        hi!
      </div>
    )

    // When
    bus.take(SET_CONTENT, myFn)
    const { container, getByText } = render(
      <ClickToCode code={code} bus={bus}>
        {children}
      </ClickToCode>
    )

    // Then
    expect(container).toMatchSnapshot()
    expect(myFn).toHaveBeenCalledTimes(0)

    // When
    fireEvent.click(getByText('hello'))

    // Then
    expect(myFn).toHaveBeenCalledTimes(1)
    expect(myFn).toHaveBeenCalledWith({
      message: code,
      type: SET_CONTENT
    })
  })
})
