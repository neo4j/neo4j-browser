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
import Accordion from './Accordion'
import '@testing-library/jest-dom/extend-expect'

describe('<Accordion>', () => {
  test('does not open any content by default and toggles content on title click', () => {
    // Given
    const renderProp = ({ getChildProps }) => {
      const p0 = getChildProps({ index: 0 })
      const p1 = getChildProps({ index: 1 })
      return (
        <div>
          <Accordion.Title {...p0.titleProps}>First</Accordion.Title>
          <Accordion.Content {...p0.contentProps}>
            First Content
          </Accordion.Content>
          <Accordion.Title {...p1.titleProps}>Second</Accordion.Title>
          <Accordion.Content {...p1.contentProps}>
            Second Content
          </Accordion.Content>
        </div>
      )
    }
    // When
    const { getByText, queryByText } = render(<Accordion render={renderProp} />)

    // Then
    expect(getByText('First')).toBeInTheDocument()
    expect(getByText('Second')).toBeInTheDocument()
    expect(queryByText('First Content')).toBeNull()
    expect(queryByText('Second Content')).toBeNull()

    // When
    fireEvent.click(getByText('First'))

    // Then
    expect(getByText('First')).toBeInTheDocument()
    expect(getByText('Second')).toBeInTheDocument()
    expect(getByText('First Content')).toBeInTheDocument()
    expect(queryByText('Second Content')).toBeNull()

    // When
    fireEvent.click(getByText('Second'))

    // Then
    expect(getByText('First')).toBeInTheDocument()
    expect(getByText('Second')).toBeInTheDocument()
    expect(queryByText('First Content')).toBeNull()
    expect(getByText('Second Content')).toBeInTheDocument()

    // When
    fireEvent.click(getByText('Second'))

    // Then
    expect(getByText('First')).toBeInTheDocument()
    expect(getByText('Second')).toBeInTheDocument()
    expect(queryByText('First Content')).toBeNull()
    expect(queryByText('Second Content')).toBeNull()
  })

  test('can have content panes open by default and works as usual after that', () => {
    // Given
    const renderProp = ({ getChildProps }) => {
      const p0 = getChildProps({ index: 0, defaultActive: true })
      const p1 = getChildProps({ index: 1 })
      const p2 = getChildProps({ index: 2, defaultActive: true })
      return (
        <div>
          <Accordion.Title {...p0.titleProps}>First</Accordion.Title>
          <Accordion.Content {...p0.contentProps}>
            First Content
          </Accordion.Content>
          <Accordion.Title {...p1.titleProps}>Second</Accordion.Title>
          <Accordion.Content {...p1.contentProps}>
            Second Content
          </Accordion.Content>
          <Accordion.Title {...p2.titleProps}>Third</Accordion.Title>
          <Accordion.Content {...p2.contentProps}>
            Third Content
          </Accordion.Content>
        </div>
      )
    }

    // When
    const { getByText, queryByText } = render(<Accordion render={renderProp} />)

    // Then
    expect(getByText('First')).toBeInTheDocument()
    expect(getByText('Second')).toBeInTheDocument()
    expect(getByText('Third')).toBeInTheDocument()
    expect(getByText('First Content')).toBeInTheDocument()
    expect(queryByText('Second Content')).toBeNull()
    expect(getByText('Third Content')).toBeInTheDocument()

    // When
    fireEvent.click(getByText('First'))

    // Then
    expect(getByText('First')).toBeInTheDocument()
    expect(getByText('Second')).toBeInTheDocument()
    expect(getByText('Third')).toBeInTheDocument()
    expect(queryByText('First Content')).toBeNull()
    expect(queryByText('Second Content')).toBeNull()
    expect(queryByText('Third Content')).toBeNull()

    // When
    fireEvent.click(getByText('Second'))

    // Then
    expect(getByText('First')).toBeInTheDocument()
    expect(getByText('Second')).toBeInTheDocument()
    expect(getByText('Third')).toBeInTheDocument()
    expect(queryByText('First Content')).toBeNull()
    expect(getByText('Second Content')).toBeInTheDocument()
    expect(queryByText('Third Content')).toBeNull()
  })

  test('can have content panes always open', () => {
    // Given
    const renderProp = ({ getChildProps }) => {
      const p0 = getChildProps({ index: 0, forceActive: true })
      const p1 = getChildProps({ index: 1 })
      const p2 = getChildProps({ index: 2, forceActive: true })
      return (
        <div>
          <Accordion.Title {...p0.titleProps}>First</Accordion.Title>
          <Accordion.Content {...p0.contentProps}>
            First Content
          </Accordion.Content>
          <Accordion.Title {...p1.titleProps}>Second</Accordion.Title>
          <Accordion.Content {...p1.contentProps}>
            Second Content
          </Accordion.Content>
          <Accordion.Title {...p2.titleProps}>Third</Accordion.Title>
          <Accordion.Content {...p2.contentProps}>
            Third Content
          </Accordion.Content>
        </div>
      )
    }

    // When
    const { getByText, queryByText } = render(<Accordion render={renderProp} />)

    // Then
    expect(getByText('First')).toBeInTheDocument()
    expect(getByText('Second')).toBeInTheDocument()
    expect(getByText('Third')).toBeInTheDocument()
    expect(getByText('First Content')).toBeInTheDocument()
    expect(queryByText('Second Content')).toBeNull()
    expect(getByText('Third Content')).toBeInTheDocument()

    // When
    // Click a closed title does not close the forced opened
    fireEvent.click(getByText('Second'))

    // Then
    expect(getByText('First')).toBeInTheDocument()
    expect(getByText('Second')).toBeInTheDocument()
    expect(getByText('Third')).toBeInTheDocument()
    expect(getByText('First Content')).toBeInTheDocument()
    expect(getByText('Second Content')).toBeInTheDocument()
    expect(getByText('Third Content')).toBeInTheDocument()

    // When
    // Click a forced opened does not do anything
    fireEvent.click(getByText('First'))

    // Then
    expect(getByText('First')).toBeInTheDocument()
    expect(getByText('Second')).toBeInTheDocument()
    expect(getByText('Third')).toBeInTheDocument()
    expect(getByText('First Content')).toBeInTheDocument()
    expect(getByText('Second Content')).toBeInTheDocument()
    expect(getByText('Third Content')).toBeInTheDocument()

    // When
    // Click a open non-forced opened closes itself
    fireEvent.click(getByText('Second'))

    // Then
    expect(getByText('First')).toBeInTheDocument()
    expect(getByText('Second')).toBeInTheDocument()
    expect(getByText('Third')).toBeInTheDocument()
    expect(getByText('First Content')).toBeInTheDocument()
    expect(queryByText('Second Content')).toBeNull()
    expect(getByText('Third Content')).toBeInTheDocument()
  })
})
