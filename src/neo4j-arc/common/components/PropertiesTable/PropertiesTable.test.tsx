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
import { render, screen, waitFor } from '@testing-library/react'
import React from 'react'

import { VizItem } from 'neo4j-arc/graph-visualization'

import {
  PropertiesTable,
  ELLIPSIS,
  MAX_LENGTH_NARROW,
  MAX_LENGTH_WIDE,
  WIDE_VIEW_THRESHOLD
} from './PropertiesTable'
import { VizItemProperty } from 'neo4j-arc/common'

describe('<DetailsPane />', () => {
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
      <PropertiesTable
        visibleProperties={propertyList}
        onMoreClick={jest.fn()}
        totalNumItems={propertyList.length}
        moreStep={1000}
        nodeInspectorWidth={width}
      />
    )
  }

  test('should handle show more on long property value', async () => {
    const fullText = `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`
    const mockProperty = {
      key: 'propWithLongValue',
      type: 'string',
      value: fullText
    }
    renderComponent({
      propertyList: [mockProperty],
      width: WIDE_VIEW_THRESHOLD - 1
    })

    const expectedCutValue = fullText.slice(0, MAX_LENGTH_NARROW) + ELLIPSIS

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
      propertyList: [mockProperty],
      width: WIDE_VIEW_THRESHOLD + 1
    })

    const expectedCutValue = fullText.slice(0, MAX_LENGTH_WIDE) + ELLIPSIS

    await waitFor(() =>
      expect(screen.getByText(expectedCutValue)).toBeInTheDocument()
    )
  })
})
