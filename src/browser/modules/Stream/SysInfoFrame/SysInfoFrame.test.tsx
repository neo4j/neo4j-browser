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
import { Provider } from 'react-redux'
import { combineReducers, createStore } from 'redux'
import { Bus } from 'suber'

import { SysInfoFrame, SysInfoFrameProps } from './SysInfoFrame'
import reducers from 'project-root/src/shared/rootReducer'
import { Database } from 'shared/modules/dbMeta/dbMetaDuck'
import { Frame } from 'shared/modules/frames/framesDuck'

const baseProps = {
  databases: [],
  bus: { self: () => undefined } as unknown as Bus,
  frame: {} as Frame,
  hasMultiDbSupport: true,
  isConnected: true,
  isEnterprise: true,
  useDb: 'neo4j',
  isFullscreen: false,
  isCollapsed: false,
  isOnCluster: true,
  namespacesEnabled: false,
  metricsPrefix: 'neo4j'
}

const mountWithStore = (props: Partial<SysInfoFrameProps>) => {
  const reducer = combineReducers({ ...(reducers as any) })
  const store: any = createStore(reducer)
  return render(
    <Provider store={store}>
      <SysInfoFrame {...baseProps} {...props} />
    </Provider>
  )
}

describe('sysinfo component', () => {
  test('should not render cluster table', () => {
    // Given
    const props = { isOnCluster: false, isConnected: true }

    // When
    const { queryByTestId } = render(<SysInfoFrame {...baseProps} {...props} />)

    // Then
    expect(queryByTestId('sysinfo-cluster-members-title')).toBeNull()
  })

  test('should display error when there is no connection', () => {
    // Given
    const props = { isConnected: false }

    // When
    const { getByText } = mountWithStore(props)

    // Then
    expect(getByText(/No connection available/i)).not.toBeNull()
  })

  test('should display all sysinfo content for enterprise edition', () => {
    // Given
    const databases = [
      { name: 'neo4j', address: '0.0.0.0:7687', status: 'online' },
      { name: 'system', address: '0.0.0.0:7687', status: 'online' }
    ] as Database[]
    const props = {
      isConnected: true,
      isEnterprise: true,
      hasMultiDbSupport: true,
      databases: databases
    }

    // When
    const { queryByText } = render(<SysInfoFrame {...baseProps} {...props} />)

    // Then
    expect(queryByText('Databases')).not.toBeNull()
    expect(queryByText('Store Size')).not.toBeNull()
    expect(queryByText('Id Allocation')).not.toBeNull()
    expect(queryByText('Page Cache')).not.toBeNull()
    expect(queryByText('Transactions')).not.toBeNull()

    expect(
      queryByText(
        'Complete sysinfo is available only in Neo4j Enterprise Edition.'
      )
    ).toBeNull()
  })

  test('should display only databases table and disclaimer for not enterprise editions', () => {
    // Given
    const databases = [
      { name: 'neo4j', address: '0.0.0.0:7687', status: 'online' },
      { name: 'system', address: '0.0.0.0:7687', status: 'online' }
    ] as Database[]
    const props = {
      isConnected: true,
      isEnterprise: false,
      hasMultiDbSupport: true,
      databases: databases
    }

    // When
    const { queryByText } = render(<SysInfoFrame {...baseProps} {...props} />)

    // Then
    expect(queryByText('Databases')).not.toBeNull()
    expect(
      queryByText(
        'Complete sysinfo is available only in Neo4j Enterprise Edition.'
      )
    ).not.toBeNull()

    // And
    expect(queryByText('Store Size')).toBeNull()
    expect(queryByText('Id Allocation')).toBeNull()
    expect(queryByText('Page Cache')).toBeNull()
    expect(queryByText('Transactions')).toBeNull()
  })
})
