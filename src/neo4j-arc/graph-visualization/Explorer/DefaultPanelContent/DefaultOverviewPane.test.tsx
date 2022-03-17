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
import { GraphStyleModel } from '../../models/GraphStyle'
import React from 'react'

import DefaultOverviewPane, { OVERVIEW_STEP_SIZE } from './DefaultOverviewPane'
import {
  GraphStats,
  GraphStatsLabels,
  GraphStatsRelationshipTypes
} from '../../utils/mapper'

describe('Default <OverviewPane />', () => {
  const graphStyle = new GraphStyleModel()

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
      (acc: GraphStatsRelationshipTypes, _current, index) => {
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
      <DefaultOverviewPane
        graphStyle={graphStyle}
        hasTruncatedFields={false}
        nodeCount={nodeCount}
        relationshipCount={relationshipCount}
        stats={graphStats}
        infoMessage={null}
      />
    )
  }

  test('should handle show all labels', () => {
    const stats = {
      ...mockGraphStats,
      labels: getMockLabels(51)
    }
    renderComponent({ graphStats: stats })

    expect(screen.getByRole('button', { name: 'Show all' })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Show 1 more' })
    ).toBeInTheDocument()
    expect(screen.queryByText('label50')).not.toBeInTheDocument()

    const showAllButton = screen.getByRole('button', { name: 'Show all' })
    showAllButton.click()

    expect(screen.getByText('label50 (1)')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Show all' })
    ).not.toBeInTheDocument()
  })

  test('should handle show more labels', () => {
    const stats = {
      ...mockGraphStats,
      labels: getMockLabels(102)
    }
    renderComponent({ graphStats: stats })

    expect(screen.getByRole('button', { name: 'Show all' })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: `Show ${OVERVIEW_STEP_SIZE} more` })
    ).toBeInTheDocument()
    expect(screen.queryByText('label50 (1)')).not.toBeInTheDocument()

    const showMoreButton = screen.getByRole('button', {
      name: `Show ${OVERVIEW_STEP_SIZE} more`
    })
    showMoreButton.click()

    expect(screen.getByText('label50 (1)')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Show all' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Show 2 more' })
    ).toBeInTheDocument()
  })

  test('should handle show all rel types', () => {
    const stats = {
      ...mockGraphStats,
      relTypes: getRelTypes(51)
    }
    renderComponent({ graphStats: stats })

    expect(screen.getByRole('button', { name: 'Show all' })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Show 1 more' })
    ).toBeInTheDocument()
    expect(screen.queryByText('relType50 (1)')).not.toBeInTheDocument()

    const showAllButton = screen.getByRole('button', { name: 'Show all' })
    showAllButton.click()

    expect(screen.getByText('relType50 (1)')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Show all' })
    ).not.toBeInTheDocument()
  })

  test('should handle show more rel types', () => {
    const stats = {
      ...mockGraphStats,
      relTypes: getRelTypes(102)
    }
    renderComponent({ graphStats: stats })

    expect(screen.getByRole('button', { name: 'Show all' })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: `Show ${OVERVIEW_STEP_SIZE} more` })
    ).toBeInTheDocument()
    expect(screen.queryByText('relType50 (1)')).not.toBeInTheDocument()

    const showMoreButton = screen.getByRole('button', {
      name: `Show ${OVERVIEW_STEP_SIZE} more`
    })
    showMoreButton.click()

    expect(screen.getByText('relType50 (1)')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Show all' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Show 2 more' })
    ).toBeInTheDocument()
  })
})
