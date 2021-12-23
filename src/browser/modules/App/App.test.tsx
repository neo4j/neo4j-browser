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

/* eslint-disable react/display-name */
import { render } from '@testing-library/react'
import React from 'react'
import configureMockStore from 'redux-mock-store'

import { App } from './App'

const mockStore = configureMockStore()
const store = mockStore({})

jest.mock('../FeatureToggle/FeatureToggleProvider', () => {
  return ({ children }: any) => <div>{children}</div>
})
jest.mock('./PerformanceOverlay.tsx', () => () => <div />)
jest.mock('./styled', () => {
  const orig = jest.requireActual('./styled')
  return {
    ...orig,
    StyledApp: () => <div>Loaded</div>
  }
})

describe('App', () => {
  test('App loads', async () => {
    // Given
    const props = {
      store,
      telemetrySettings: {
        allowUserStats: false,
        allowCrashReporting: false,
        source: 'BROWSER_SETTING'
      }
    }

    // When
    const { getByText } = render(<App {...props} />)

    // Then
    expect(getByText('Loaded'))
  })
})
