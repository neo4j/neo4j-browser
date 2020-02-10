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

import { fireEvent, render } from '@testing-library/react'
import React from 'react'
import { Provider } from 'react-redux'
import { createStore } from 'redux'

import Favorites from './static-scripts'
import { folders, scripts } from 'shared/modules/favorites/staticScripts'

describe('<Favorites />', () => {
  // Rename the two show meta-graph scripts so they can be distinguished from each other in DOM
  const documents = scripts.map(script => ({
    ...script,
    isStatic: true,
    content: !script.content.includes('Show meta-graph')
      ? script.content
      : script.versionRange === '>=3 <4'
      ? script.content.replace('Show meta-graph', 'Show meta-graph v3')
      : script.content.replace('Show meta-graph', 'Show meta-graph v4')
  }))

  const renderWithDBMSVersion = version => {
    const state = {
      documents,
      folders,
      meta: { server: { version } }
    }

    return render(
      <Provider store={createStore(() => state, state)}>
        <Favorites />
      </Provider>
    )
  }

  it('lists the "Connect to DBMS" example when there is no DBMS version', () => {
    const version = null
    const { queryByText } = renderWithDBMSVersion(version)

    fireEvent.click(queryByText('Basic Queries'))

    expect(queryByText('Connect to DBMS')).toBeTruthy()
  })

  it('lists only the v3 version of the "Show meta-graph" example when version is 3', () => {
    const version = '3.5.14'
    const { queryByText } = renderWithDBMSVersion(version)

    fireEvent.click(queryByText('Common Procedures'))

    expect(queryByText('Show meta-graph v3')).toBeTruthy()
    expect(queryByText('Show meta-graph v4')).toBeFalsy()
  })

  it('lists only the v4 version of the "Show meta-graph" example when version is 4', () => {
    const version = '4.0.3'
    const { queryByText } = renderWithDBMSVersion(version)

    fireEvent.click(queryByText('Common Procedures'))

    expect(queryByText('Show meta-graph v3')).toBeFalsy()
    expect(queryByText('Show meta-graph v4')).toBeTruthy()
  })
})
