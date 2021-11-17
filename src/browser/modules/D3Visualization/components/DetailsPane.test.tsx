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

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import {
  DETAILS_PANE_STEP_SIZE,
  DetailsPaneComponent,
  MAX_LENGTH_LARGE,
  MAX_LENGTH_SMALL,
  WIDE_VIEW_THRESHOLD
} from './DetailsPane'
import { VizItem, VizNodeProperty } from './types'

describe('<DetailsPane />', () => {
  const mockGraphStyle = {
    forNode: null,
    forRelationship: null,
    loadRules: null,
    resetToDefault: null,
    rules: [],
    toSheet: null
  }

  const getMockProperties: (length: number) => VizNodeProperty[] = length =>
    Array.from({ length: length }).map((_v, index) => {
      return {
        key: `prop${String(index).padStart(String(length).length, '0')}`,
        type: 'string',
        value: 'hej'
      }
    })

  type RenderComponentProps = {
    properties?: VizItem[]
    labels?: string[]
    type?: 'node' | 'relationship'
    width?: number
  }
  const renderComponent = ({
    properties = [],
    labels = [],
    type = 'node',
    width = 200
  }: RenderComponentProps) => {
    let mockVizItem: VizItem
    switch (type) {
      case 'node':
        mockVizItem = {
          type: type,
          item: {
            id: 'abc',
            labels: labels,
            properties: properties
          }
        }
        break
      case 'relationship':
        mockVizItem = {
          type: type,
          item: {
            id: 'abc',
            properties: properties
          }
        }
    }
    return render(
      <DetailsPaneComponent
        frameHeight={0}
        graphStyle={mockGraphStyle}
        vizItem={mockVizItem}
        nodeInspectorWidth={width}
      />
    )
  }

  test('should handle show all properties', async () => {
    renderComponent({ properties: getMockProperties(1001) })

    expect(screen.getByRole('button', { name: 'Show all' })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Show 2 more' })
    ).toBeInTheDocument() // id is added to list of properties so only showing 999
    expect(screen.queryByText('prop1000')).not.toBeInTheDocument()

    const showAllButton = screen.getByText('Show all')
    showAllButton.click()

    expect(screen.getByText('prop1000')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Show all' })
    ).not.toBeInTheDocument()
  })

  test('should handle show more properties', async () => {
    renderComponent({ properties: getMockProperties(2001) })

    expect(
      screen.getByRole('button', {
        name: `Show ${DETAILS_PANE_STEP_SIZE} more`
      })
    ).toBeInTheDocument()
    expect(screen.queryByText('prop1000')).not.toBeInTheDocument()

    const showMoreButton = screen.getByRole('button', {
      name: `Show ${DETAILS_PANE_STEP_SIZE} more`
    })
    showMoreButton.click()

    expect(screen.getByText('prop1000')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Show all' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Show 2 more' })
    ).toBeInTheDocument()
  })

  test('should handle show more on long property value', async () => {
    const fullText = `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`
    const mockProperty = {
      key: 'propWithLongValue',
      type: 'string',
      value: fullText
    }
    renderComponent({
      properties: [mockProperty],
      width: WIDE_VIEW_THRESHOLD - 1
    })

    const expectedCutValue = fullText.slice(0, MAX_LENGTH_SMALL) + '...'

    await waitFor(() =>
      expect(screen.getByText(expectedCutValue)).toBeInTheDocument()
    )
    expect(
      screen.getByRole('button', {
        name: 'Show all'
      })
    ).toBeInTheDocument()
    expect(screen.queryByText(fullText)).not.toBeInTheDocument()

    const showAllButton = screen.getByRole('button', {
      name: 'Show all'
    })
    showAllButton.click()

    await waitFor(() => expect(screen.getByText(fullText)).toBeInTheDocument())
    expect(
      screen.queryByRole('button', { name: 'Show all' })
    ).not.toBeInTheDocument()
  })

  test('should cut a long property value to longer size when in wide mode', async () => {
    const fullText = `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`
    const mockProperty = {
      key: 'propWithLongValue',
      type: 'string',
      value: fullText
    }
    renderComponent({
      properties: [mockProperty],
      width: WIDE_VIEW_THRESHOLD + 1
    })

    const expectedCutValue = fullText.slice(0, MAX_LENGTH_LARGE) + '...'

    await waitFor(() =>
      expect(screen.getByText(expectedCutValue)).toBeInTheDocument()
    )
  })
})
