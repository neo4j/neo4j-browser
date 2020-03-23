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

import { render, fireEvent } from '@testing-library/react'
import React from 'react'
import configureMockStore from 'redux-mock-store'

import Main from './Main'

const mockStore = configureMockStore()
const store = mockStore({})

jest.mock('../Stream/auto-exec-button', () => () => <div></div>)
jest.mock('../Editor/Editor', () => () => <div></div>)
jest.mock('../Stream/Stream', () => () => <div></div>)

describe('<Main />', () => {
  it('should display an ErrorBanner when useDb is not in databases list', () => {
    const useDb = 'some database'
    const databases = []

    const { queryByText } = render(
      <Main
        {...{
          databases,
          useDb,
          store
        }}
      />
    )

    expect(
      queryByText(`Database '${useDb}' is unavailable.`, { exact: false })
    ).toBeTruthy()
  })

  it('should display an ErrorBanner when useDb is not online in databases list', () => {
    const useDb = 'some database'
    const databases = [{ name: useDb, status: 'offline' }]

    const { queryByText } = render(
      <Main
        {...{
          databases,
          useDb,
          store
        }}
      />
    )

    expect(
      queryByText(`Database '${useDb}' is unavailable.`, { exact: false })
    ).toBeTruthy()
  })
})
