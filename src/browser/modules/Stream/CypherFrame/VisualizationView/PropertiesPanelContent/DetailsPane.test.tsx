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
import { render, screen } from '@testing-library/react'
import React from 'react'

import { DETAILS_PANE_STEP_SIZE, DetailsPane } from './DetailsPane'
import { VizItemProperty } from 'neo4j-arc/common'
import { GraphStyleModel, VizItem } from 'neo4j-arc/graph-visualization'

describe('<DetailsPane />', () => {
  const mockGraphStyle = new GraphStyleModel()

  const getMockProperties: (length: number) => VizItemProperty[] = length =>
    Array.from({ length: length }).map((_v, index) => {
      return {
        key: `prop${String(index).padStart(String(length).length, '0')}`,
        type: 'string',
        value: 'hej'
      }
    })

  type RenderComponentProps = {
    propertyList?: VizItemProperty[]
    labels?: string[]
    type?: 'node' | 'relationship'
    width?: number
  }
  const renderComponent = ({
    propertyList = [],
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
            elementId: 'abc',
            labels,
            propertyList
          }
        }
        break
      case 'relationship':
        mockVizItem = {
          type: type,
          item: {
            id: 'abc',
            elementId: 'abc',
            type: 'abc2',
            propertyList
          }
        }
    }
    return render(
      <DetailsPane
        graphStyle={mockGraphStyle}
        vizItem={mockVizItem}
        nodeInspectorWidth={width}
      />
    )
  }

  test('should handle show all properties', async () => {
    renderComponent({ propertyList: getMockProperties(1001) })

    expect(screen.getByRole('button', { name: 'Show all' })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Show 3 more' })
    ).toBeInTheDocument() // id & elementId is added to list of properties so only showing 998
    expect(screen.queryByText('prop1000')).not.toBeInTheDocument()

    const showAllButton = screen.getByText('Show all')
    showAllButton.click()

    expect(screen.getByText('prop1000')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Show all' })
    ).not.toBeInTheDocument()
  })

  test('should handle show more properties', async () => {
    renderComponent({ propertyList: getMockProperties(2001) })

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
      screen.getByRole('button', { name: 'Show 3 more' })
    ).toBeInTheDocument()
  })
})
