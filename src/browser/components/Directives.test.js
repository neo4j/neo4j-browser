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

/* global test, expect, jest, MouseEvent */
import React from 'react'
import { render, fireEvent, cleanup } from 'react-testing-library'
import { Directives as DirectivesComponent } from './Directives'

afterEach(cleanup)

describe('Directives', () => {
  test('should attach play topic directive when contents has a play-topic attribute', () => {
    // Given
    const clickEvent = jest.fn()
    const html = <a play-topic='hello'>button</a>

    // When
    const { container, getByText } = render(
      <DirectivesComponent content={html} onItemClick={clickEvent} />
    )
    fireEvent(
      getByText('button'),
      new MouseEvent('click', {
        bubbles: true, // click events must bubble for React to see it
        cancelable: true
      })
    )

    // Then
    expect(clickEvent).toHaveBeenCalled()
    expect(clickEvent).toHaveBeenCalledWith(':play hello', true)
    expect(container).toMatchSnapshot()
  })
  test('should attach help topic directive when contents has a play-topic attribute', () => {
    // Given
    const clickEvent = jest.fn()
    const html = <a help-topic='hello'>link</a>

    // When
    const { container, getByText } = render(
      <DirectivesComponent content={html} onItemClick={clickEvent} />
    )
    fireEvent(
      getByText('link'),
      new MouseEvent('click', {
        bubbles: true, // click events must bubble for React to see it
        cancelable: true
      })
    )

    // Then
    expect(clickEvent).toHaveBeenCalled()
    expect(clickEvent).toHaveBeenCalledWith(':help hello', true)
    expect(container).toMatchSnapshot()
  })
  test('should attach runnable directive when element has a tag of `pre.runnable`', () => {
    // Given
    const clickEvent = jest.fn()
    const html = <pre className='runnable'>my code</pre>

    // When
    const { container, getByText } = render(
      <DirectivesComponent content={html} onItemClick={clickEvent} />
    )
    fireEvent(
      getByText('my code'),
      new MouseEvent('click', {
        bubbles: true, // click events must bubble for React to see it
        cancelable: true
      })
    )

    // Then
    expect(clickEvent).toHaveBeenCalled()
    expect(clickEvent).toHaveBeenCalledWith('my code', false)
    expect(container).toMatchSnapshot()
  })
  test('should attach runnable directive when element has a class name of `.runnable pre`', () => {
    // Given
    const clickEvent = jest.fn()
    const html = (
      <span className='runnable'>
        <pre>my code</pre>
      </span>
    )

    // When
    const { container, getByText } = render(
      <DirectivesComponent content={html} onItemClick={clickEvent} />
    )
    fireEvent(
      getByText('my code'),
      new MouseEvent('click', {
        bubbles: true, // click events must bubble for React to see it
        cancelable: true
      })
    )

    // Then
    expect(clickEvent).toHaveBeenCalled()
    expect(clickEvent).toHaveBeenCalledWith('my code', false)
    expect(container).toMatchSnapshot()
  })
  test('should attach all directives when contents has both attributes in different elements', () => {
    // Given
    const clickEvent = jest.fn()
    const html = (
      <div>
        <a help-topic='help'>help</a>
        <a play-topic='play'>play</a>
      </div>
    )

    // When
    const { container, getByText } = render(
      <DirectivesComponent content={html} onItemClick={clickEvent} />
    )
    fireEvent(
      getByText('help'),
      new MouseEvent('click', {
        bubbles: true, // click events must bubble for React to see it
        cancelable: true
      })
    )
    fireEvent(
      getByText('play'),
      new MouseEvent('click', {
        bubbles: true, // click events must bubble for React to see it
        cancelable: true
      })
    )

    // Then
    expect(clickEvent).toHaveBeenCalledTimes(2)
    expect(clickEvent).toHaveBeenCalledWith(':help help', true)
    expect(clickEvent).toHaveBeenCalledWith(':play play', true)
    expect(container).toMatchSnapshot()
  })
  test('should not attach any directives when contents does not have any directive attributes', () => {
    // Given
    const clickEvent = jest.fn()
    const html = <a>foobar</a>

    // When
    const { container, getByText } = render(
      <DirectivesComponent content={html} onItemClick={clickEvent} />
    )
    fireEvent(
      getByText('foobar'),
      new MouseEvent('click', {
        bubbles: true, // click events must bubble for React to see it
        cancelable: true
      })
    )

    // Then
    expect(clickEvent).not.toHaveBeenCalled()
    expect(container).toMatchSnapshot()
  })
})
