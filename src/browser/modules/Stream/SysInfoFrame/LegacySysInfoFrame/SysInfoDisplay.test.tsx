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
import { render } from '@testing-library/react'
import React from 'react'

import { SysInfoDisplay } from './SysInfoDisplay'

describe('sysinfo component', () => {
  test('should render cluster table', () => {
    // Given
    const props = { isOnCluster: true, isConnected: true }

    // When
    const { getByText, container } = render(<SysInfoDisplay {...props} />)

    // Then
    expect(getByText('Cluster Members')).not.toBeNull()
    expect(
      container.querySelector('[data-testid="sysinfo-cluster-members-title"]')
    ).not.toBeNull()
  })
  test('should not render cluster table', () => {
    // Given
    const props = { isOnCluster: false, isConnected: true }

    // When
    const { queryByTestId } = render(<SysInfoDisplay {...props} />)

    // Then
    expect(queryByTestId('sysinfo-cluster-members-title')).toBeNull()
  })
})
