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

/* global test, expect, jest */

import React from 'react'
import { render, wait, cleanup } from 'react-testing-library'
import DesktopIntegration from './index'

afterEach(cleanup)

describe('<DesktopIntegration>', () => {
  test('does not render anything if no integration point', () => {
    // Given
    const integrationPoint = null

    // When
    const { container } = render(
      <DesktopIntegration integrationPoint={integrationPoint} />
    )

    // Then
    expect(container).toMatchSnapshot()
  })
  test('does not render anything if there is an integration point', () => {
    // Given
    const integrationPoint = { x: true }

    // When
    const { container } = render(
      <DesktopIntegration integrationPoint={integrationPoint} />
    )

    // Then
    expect(container).toMatchSnapshot()
  })
  test('calls onMount with data on mounting', async () => {
    // Given
    const mFn = jest.fn()
    const context = {
      projects: [
        {
          graphs: [
            {
              status: 'ACTIVE',
              configuration: {
                protocols: {
                  bolt: {
                    username: 'neo4j'
                  }
                }
              }
            }
          ]
        }
      ]
    }
    const integrationPoint = { getContext: () => Promise.resolve(context) }

    // When
    const { container, rerender } = render(
      <DesktopIntegration integrationPoint={integrationPoint} onMount={mFn} />
    )
    await wait(() => expect(mFn).toHaveBeenCalledTimes(1))
    // Then
    expect(container).toMatchSnapshot()

    // When
    rerender(<DesktopIntegration integrationPoint={integrationPoint} />)

    // Then
    expect(mFn).toHaveBeenCalledTimes(1)
    expect(container).toMatchSnapshot()
  })
  test('calls onXxx with data on event XXX', () => {
    // Given
    let componentOnContextUpdate
    const fn = jest.fn()
    const oldContext = { projects: [] }
    const newContext = { projects: [{ project: {} }] }
    const event = { type: 'XXX' }
    const nonListenEvent = { type: 'YYY' }
    const integrationPoint = {
      onContextUpdate: fn => (componentOnContextUpdate = fn)
    }

    // When
    const { container } = render(
      <DesktopIntegration integrationPoint={integrationPoint} onXxx={fn} />
    )

    // Then
    expect(fn).toHaveBeenCalledTimes(0)

    // When
    componentOnContextUpdate(event, newContext, oldContext)

    // Then
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenLastCalledWith(event, newContext, oldContext)

    // When
    componentOnContextUpdate(nonListenEvent, newContext, oldContext) // We don't listen for this

    // Then
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenLastCalledWith(event, newContext, oldContext)

    // When
    componentOnContextUpdate(event, newContext, oldContext) // Another one we're listening on

    // Then
    expect(fn).toHaveBeenCalledTimes(2)
    expect(fn).toHaveBeenLastCalledWith(event, newContext, oldContext)
    expect(container).toMatchSnapshot()
  })
})
