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
import { render } from '@testing-library/react'
import { SysInfoFrame } from './index'

jest.mock(
  'browser/modules/Frame/FrameTemplate',
  // eslint-disable-next-line
  () => ({ contents, children }) => (
    <div>
      {contents}
      {children}
    </div>
  )
)

describe('sysinfo component', () => {
  test('should render causal cluster table', () => {
    // Given
    const props = { isACausalCluster: true, isConnected: true }

    // When
    const { getByText, container } = render(<SysInfoFrame {...props} />)

    // Then
    expect(getByText('Causal Cluster Members')).not.toBeNull()
    expect(
      container.querySelector(
        '[data-testid="sysinfo-casual-cluster-members-title"]'
      )
    ).not.toBeNull()
  })
  test('should not render causal cluster table', () => {
    // Given
    const props = { isACausalCluster: false, isConnected: true }

    // When
    const { queryByTestId } = render(<SysInfoFrame {...props} />)

    // Then
    expect(queryByTestId('sysinfo-casual-cluster-members-title')).toBeNull()
  })

  test('should display error when there is no connection', () => {
    // Given
    const props = { isConnected: false }

    // When
    const { getByText } = render(<SysInfoFrame {...props} />)

    // Then
    expect(getByText(/No connection available/i)).not.toBeNull()
  })
})
