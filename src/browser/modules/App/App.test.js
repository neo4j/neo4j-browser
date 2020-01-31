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

/* global jest, test, expect */
/* eslint-disable react/display-name */

import React from 'react'
import { render } from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import { App } from './App'

const mockStore = configureMockStore()
const store = mockStore({})

jest.mock('../FeatureToggle/FeatureToggleProvider', () => {
  return ({ children }) => <div>{children}</div>
})
jest.mock('./styled', () => {
  const orig = require.requireActual('./styled')
  return {
    ...orig,
    StyledApp: () => <div>Loaded</div>
  }
})

describe('App', () => {
  test('App loads', async () => {
    // Given
    const props = {
      store
    }

    // When
    const { getByText } = render(<App {...props} />)

    // Then
    expect(getByText('Loaded'))
  })
})
