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
import { render, waitFor } from '@testing-library/react'
import React from 'react'

import DesktopApi from './desktop-api'

describe('<DesktopApi>', () => {
  test('does not render anything if no integration point', () => {
    // Given
    const integrationPoint = null

    // When
    const { container } = render(
      <DesktopApi integrationPoint={integrationPoint} />
    )

    // Then
    expect(container).toMatchInlineSnapshot(`<div />`)
  })
  test('does not render anything if there is an integration point', () => {
    // Given
    const integrationPoint = { x: true }

    // When
    const { container } = render(
      <DesktopApi integrationPoint={integrationPoint} />
    )

    // Then
    expect(container).toMatchInlineSnapshot(`<div />`)
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
    const { rerender } = render(
      <DesktopApi integrationPoint={integrationPoint} onMount={mFn} />
    )
    await waitFor(() => expect(mFn).toHaveBeenCalledTimes(1))

    // When
    rerender(<DesktopApi integrationPoint={integrationPoint} />)

    // Then
    expect(mFn).toHaveBeenCalledTimes(1)
  })
  test('calls onXxx with data on event XXX', () => {
    // Given
    let componentOnContextUpdate = (_e: any, _nc: any, _oc: any) => undefined
    const fn = jest.fn()
    const oldContext = { projects: [] }
    const newContext = { projects: [{ project: {} }] }
    const event = { type: 'XXX' }
    const nonListenEvent = { type: 'YYY' }
    const integrationPoint = {
      onContextUpdate: (fn: any) => (componentOnContextUpdate = fn),
      getKerberosTicket: jest.fn()
    }

    // When
    render(<DesktopApi integrationPoint={integrationPoint} onXxx={fn} />)

    // Then
    expect(fn).toHaveBeenCalledTimes(0)

    // When
    componentOnContextUpdate(event, newContext, oldContext)

    // Then
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenLastCalledWith(
      event,
      newContext,
      oldContext,
      integrationPoint.getKerberosTicket
    )

    // When
    componentOnContextUpdate(nonListenEvent, newContext, oldContext) // We don't listen for this

    // Then
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenLastCalledWith(
      event,
      newContext,
      oldContext,
      integrationPoint.getKerberosTicket
    )

    // When
    componentOnContextUpdate(event, newContext, oldContext) // Another one we're listening on

    // Then
    expect(fn).toHaveBeenCalledTimes(2)
    expect(fn).toHaveBeenLastCalledWith(
      event,
      newContext,
      oldContext,
      integrationPoint.getKerberosTicket
    )
  })
  test('calls onArgumentsChange when args change', () => {
    // Given
    let componentOnArgumentsChange = (_s: string) => undefined
    const newArgsString = 'test=1&test2=2'
    const fn = jest.fn()
    const integrationPoint = {
      onArgumentsChange: (fn: any) => (componentOnArgumentsChange = fn)
    }

    // When
    render(
      <DesktopApi integrationPoint={integrationPoint} onArgumentsChange={fn} />
    )

    // Then
    expect(fn).toHaveBeenCalledTimes(0)

    // When
    componentOnArgumentsChange(newArgsString)

    // Then
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenLastCalledWith(newArgsString)
  })
  test('calls sendMetrics callback if setEventMetricsCallback is set', () => {
    // Given
    let componentMetricsCallback = (_: any) => undefined
    const metricsCallArgs = {
      category: 'metrics_test',
      label: 'runs',
      data: { x: 1 }
    }
    const fn = (takeMetrics: any) => (componentMetricsCallback = takeMetrics)
    const integrationPoint = {
      sendMetrics: jest.fn()
    }

    // When
    render(
      <DesktopApi
        integrationPoint={integrationPoint}
        setEventMetricsCallback={fn}
      />
    )

    // Then
    expect(integrationPoint.sendMetrics).toHaveBeenCalledTimes(0)

    // When
    componentMetricsCallback(metricsCallArgs)

    // Then
    expect(integrationPoint.sendMetrics).toHaveBeenCalledTimes(1)
    expect(integrationPoint.sendMetrics).toHaveBeenLastCalledWith(
      metricsCallArgs.category,
      metricsCallArgs.label,
      metricsCallArgs.data
    )
  })
})
