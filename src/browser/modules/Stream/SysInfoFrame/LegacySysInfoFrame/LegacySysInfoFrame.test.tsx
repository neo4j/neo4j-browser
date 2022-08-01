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

import { LegacySysInfoFrame } from './LegacySysInfoFrame'
import reducers from 'project-root/src/shared/rootReducer'

const baseProps = {
  bus: null as any,
  frame: null as any,
  isFullscreen: false,
  isCollapsed: false,
  isOnCluster: false
}

describe('LegacySysInfoFrame', () => {
  test('should display error when there is no connection', () => {
    // Given
    const props = { ...baseProps, isConnected: false }

    // When
    const reducer = combineReducers({ ...(reducers as any) })
    const store: any = createStore(reducer)
    const { getAllByText } = render(
      <Provider store={store}>
        <LegacySysInfoFrame {...props} />
      </Provider>
    )

    // Then
    expect(getAllByText(/No connection available/i)).not.toBeNull()
  })
})
