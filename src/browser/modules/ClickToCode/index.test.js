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

/* global describe, beforeEach, afterEach, test, expect, jest */
import render from 'preact-render-to-string'
import { createBus } from 'suber'

import { ClickToCode } from './index'
import { SET_CONTENT } from 'shared/modules/editor/editorDuck'

describe('ClickToCode', () => {
  let MyComp
  let bus
  beforeEach(() => {
    MyComp = ({ onClick, children }) => {
      onClick()
      return <code>{children}</code>
    }
    bus = createBus()
  })
  afterEach(() => {
    bus.reset()
  })
  test('does not render if no children', () => {
    // Given
    const myFn = jest.fn()

    // When
    bus.take(SET_CONTENT, myFn)
    const component = render(<ClickToCode CodeComponent={MyComp} bus={bus} />)

    // Then
    expect(component).toMatchSnapshot()
    expect(myFn).toHaveBeenCalledTimes(0)
  })
  test('renders if no CodeComponent is provided', () => {
    // Given
    // When
    const component = render(<ClickToCode>my code</ClickToCode>)

    // Then
    expect(component).toMatchSnapshot()
  })
  test('renders code as the code when code is available', () => {
    // Given
    const myFn = jest.fn()
    const code = 'my code'

    // When
    bus.take(SET_CONTENT, myFn)
    const component = render(
      <ClickToCode CodeComponent={MyComp} code={code} bus={bus}>
        yo
      </ClickToCode>
    )

    // Then
    expect(component).toMatchSnapshot()
    expect(myFn).toHaveBeenCalledTimes(1)
    expect(myFn).toHaveBeenCalledWith({ message: code, type: SET_CONTENT })
  })
  test('renders children as code if no code is provided', () => {
    // Given
    const myFn = jest.fn()
    const hello = 'hello'
    const childrenString = 'hellohi!'

    // When
    bus.take(SET_CONTENT, myFn)
    const component = render(
      <ClickToCode CodeComponent={MyComp} bus={bus}>
        {hello}hi!
      </ClickToCode>
    )

    // Then
    expect(component).toMatchSnapshot()
    expect(myFn).toHaveBeenCalledTimes(1)
    expect(myFn).toHaveBeenCalledWith({
      message: childrenString,
      type: SET_CONTENT
    })
  })
  test('renders all children', () => {
    // Given
    const myFn = jest.fn()
    const code = 'my code'
    const children = (
      <div>
        <span>hello</span>hi!
      </div>
    )

    // When
    bus.take(SET_CONTENT, myFn)
    const component = render(
      <ClickToCode CodeComponent={MyComp} code={code} bus={bus}>
        {children}
      </ClickToCode>
    )

    // Then
    expect(component).toMatchSnapshot()
    expect(myFn).toHaveBeenCalledTimes(1)
    expect(myFn).toHaveBeenCalledWith({ message: code, type: SET_CONTENT })
  })
})
