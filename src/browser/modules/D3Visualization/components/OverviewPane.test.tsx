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
import { render, screen } from '@testing-library/react'
import OverviewPane, { OVERVIEW_STEP_SIZE } from './OverviewPane'
import {
  GraphStats,
  GraphStatsLabels,
  GraphStatsRelationshipTypes
} from '../mapper'

jest.mock('./StyleableNodeLabel')
jest.mock('./StyleableRelType')

describe('<OverviewPane />', () => {
  const mockGraphStyle = {
    forNode: null,
    forRelationship: null,
    loadRules: null,
    resetToDefault: null,
    rules: [],
    toSheet: null
  }

  const getMockLabels: (length: number) => GraphStatsLabels = length =>
    Array.from({ length: length }).reduce(
      (acc: GraphStatsLabels, _current, index) => {
        return {
          ...acc,
          ['label' + index]: { count: 1, properties: { key: 'abc' } }
        }
      },
      {}
    )

  const getRelTypes: (length: number) => GraphStatsRelationshipTypes = length =>
    Array.from({ length: length }).reduce(
      (acc: GraphStatsLabels, _current, index) => {
        return {
          ...acc,
          ['relType' + index]: { count: 1, properties: { key: 'abc' } }
        }
      },
      {}
    )

  const mockGraphStats: GraphStats = {
    relTypes: getRelTypes(10),
    labels: getMockLabels(10)
  }

  type RenderComponentProps = {
    graphStats?: GraphStats
    nodeCount?: number
    relationshipCount?: number
  }
  const renderComponent = ({
    graphStats = mockGraphStats,
    nodeCount = 5,
    relationshipCount = 5
  }: RenderComponentProps) => {
    return render(
      <OverviewPane
        frameHeight={0}
        graphStyle={mockGraphStyle}
        hasTruncatedFields={false}
        nodeCount={nodeCount}
        relationshipCount={relationshipCount}
        stats={graphStats}
      />
    )
  }

  test('should handle show all labels', () => {
    const stats = {
      ...mockGraphStats,
      labels: getMockLabels(51)
    }
    renderComponent({ graphStats: stats })

    expect(screen.getByText('Show all')).toBeInTheDocument()
    expect(screen.getByText('Show 1 more')).toBeInTheDocument()
    expect(screen.queryByText('label50')).not.toBeInTheDocument()

    const showAllButton = screen.getByText('Show all')
    showAllButton.click()

    expect(screen.getByText('label50')).toBeInTheDocument()
    expect(screen.queryByText('Show all')).not.toBeInTheDocument()
  })

  test('should handle show more labels', () => {
    const stats = {
      ...mockGraphStats,
      labels: getMockLabels(102)
    }
    renderComponent({ graphStats: stats })

    expect(screen.getByText('Show all')).toBeInTheDocument()
    expect(
      screen.getByText(`Show ${OVERVIEW_STEP_SIZE} more`)
    ).toBeInTheDocument()
    expect(screen.queryByText('label50')).not.toBeInTheDocument()

    const showMoreButton = screen.getByText(`Show ${OVERVIEW_STEP_SIZE} more`)
    showMoreButton.click()

    expect(screen.getByText('label50')).toBeInTheDocument()
    expect(screen.queryByText('Show all')).toBeInTheDocument()
    expect(screen.getByText('Show 2 more')).toBeInTheDocument()
  })

  test('should handle show all rel types', () => {
    const stats = {
      ...mockGraphStats,
      relTypes: getRelTypes(51)
    }
    renderComponent({ graphStats: stats })

    expect(screen.getByText('Show all')).toBeInTheDocument()
    expect(screen.getByText('Show 1 more')).toBeInTheDocument()
    expect(screen.queryByText('relType50')).not.toBeInTheDocument()

    const showAllButton = screen.getByText('Show all')
    showAllButton.click()

    expect(screen.getByText('relType50')).toBeInTheDocument()
    expect(screen.queryByText('Show all')).not.toBeInTheDocument()
  })

  test('should handle show more rel types', () => {
    const stats = {
      ...mockGraphStats,
      relTypes: getRelTypes(102)
    }
    renderComponent({ graphStats: stats })

    expect(screen.getByText('Show all')).toBeInTheDocument()
    expect(
      screen.getByText(`Show ${OVERVIEW_STEP_SIZE} more`)
    ).toBeInTheDocument()
    expect(screen.queryByText('relType50')).not.toBeInTheDocument()

    const showMoreButton = screen.getByText(`Show ${OVERVIEW_STEP_SIZE} more`)
    showMoreButton.click()

    expect(screen.getByText('relType50')).toBeInTheDocument()
    expect(screen.queryByText('Show all')).toBeInTheDocument()
    expect(screen.getByText('Show 2 more')).toBeInTheDocument()
  })
})
