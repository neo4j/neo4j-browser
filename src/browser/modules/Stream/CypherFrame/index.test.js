/*
 * Copyright (c) 2002-2018 "Neo4j, Inc"
 * Network Engine for Objects in Lund AB [http://neotechnology.com]
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
import { Provider } from 'react-redux'

import { CypherFrame } from './index.jsx'

const createProps = (status, result) => ({
  recentView: undefined,
  frame: {},
  request: {
    status,
    updated: Math.random(),
    result
  }
})
const withProvider = (store, children) => {
  return <Provider store={store}>{children}</Provider>
}

describe('CypherFrame', () => {
  const store = {
    subscribe: () => {},
    dispatch: () => {},
    getState: () => ({
      settings: {
        maxRows: 1000,
        maxFieldItems: 1000
      }
    })
  }
  test('renders accordingly from pending to success to error to success', () => {
    // Given
    const pendingProps = createProps('pending', undefined)
    const successProps = createProps('success', {
      records: [{ keys: ['name'], _fields: ['Molly'], get: () => 'Molly' }]
    })
    const errorProps = createProps('error', { code: 'Test.Error' })

    // When
    const {
      queryByText,
      getByText,
      getAllByText,
      getByTestId,
      rerender
    } = render(withProvider(store, <CypherFrame {...pendingProps} />))

    // Then
    expect(getByTestId('spinner')).not.toBeNull()
    expect(getByText(/Table/i)).not.toBeNull()
    expect(getByText(/Code/i)).not.toBeNull()
    expect(queryByText(/Error/)).toBeNull()

    // When successful request
    rerender(withProvider(store, <CypherFrame {...successProps} />))

    // Then
    expect(getByText(/Molly/i)).not.toBeNull()
    expect(getByText(/Table/i)).not.toBeNull()
    expect(getByText(/Code/i)).not.toBeNull()
    expect(queryByText(/Error/)).toBeNull()

    // When error request
    rerender(withProvider(store, <CypherFrame {...errorProps} />))

    // Then
    expect(queryByText(/Table/i)).toBeNull()
    expect(queryByText(/Code/i)).toBeNull()
    expect(getAllByText(/Error/)).not.toBeNull()
    expect(getAllByText(/Test.Error/)).not.toBeNull()

    // When successful request again
    rerender(withProvider(store, <CypherFrame {...successProps} />))

    // Then
    expect(getByText(/Molly/i)).not.toBeNull()
    expect(getByText(/Table/i)).not.toBeNull()
    expect(getByText(/Code/i)).not.toBeNull()
    expect(queryByText(/Error/)).toBeNull()
  })
})
