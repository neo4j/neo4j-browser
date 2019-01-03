/*
 * Copyright (c) 2002-2019 "Neo4j, Inc"
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

/* global describe, test, expect */
import React from 'react'
import { render } from 'react-testing-library'

import { FeatureToggleProvider, Consumer } from './FeatureToggleProvider'

const MyConsumer = () => {
  return (
    <h1>
      <Consumer>
        {showFeature => {
          return showFeature('testFeature') ? 'Yes' : 'No'
        }}
      </Consumer>
    </h1>
  )
}

describe('FeatureToggleProvider', () => {
  test('exposes "showFeature" in app context and returns the feature state (true)', () => {
    // Given
    const features = {
      testFeature: { on: true },
      anotherFeature: { on: false }
    }
    const { getByText, queryByText } = render(
      <FeatureToggleProvider features={features}>
        <MyConsumer />
      </FeatureToggleProvider>
    )

    // Then
    expect(getByText('Yes')).not.toBeUndefined()
    expect(queryByText('No')).toBeNull()
  })
  test('exposes "showFeature" in app context and returns the feature state (false)', () => {
    // Given
    const features = {
      testFeature: { on: false },
      anotherFeature: { on: true }
    }
    const { getByText, queryByText } = render(
      <FeatureToggleProvider features={features}>
        <MyConsumer />
      </FeatureToggleProvider>
    )

    // Then
    expect(getByText('No')).not.toBeUndefined()
    expect(queryByText('Yes')).toBeNull()
  })
  test('returns true for unknown features', () => {
    // Given
    const features = { anotherFeature: { on: false } }
    const { getByText, queryByText } = render(
      <FeatureToggleProvider features={features}>
        <MyConsumer />
      </FeatureToggleProvider>
    )

    // Then
    expect(getByText('Yes')).not.toBeUndefined()
    expect(queryByText('No')).toBeNull()
  })
})
