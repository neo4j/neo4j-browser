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

import reducer, {
  NAME,
  enableExperimentalFeature,
  disableExperimentalFeature,
  getExperimentalFeatures,
  showFeature,
  experimentalFeatureSelfName,
  initialState
} from './experimentalFeaturesDuck'
import { dehydrate } from 'services/duckUtils'
import { APP_START } from '../app/appDuck'

describe('experimentalFeatures reducer', () => {
  test('handles initial value', () => {
    const nextState = dehydrate(reducer(undefined, { type: '' }))
    expect(nextState[experimentalFeatureSelfName].on).toEqual(true)
  })

  test('handles FEATURE_ON without initial state', () => {
    const action = enableExperimentalFeature(experimentalFeatureSelfName)
    const nextState = reducer(undefined, action)
    expect(nextState[experimentalFeatureSelfName].on).toEqual(true)
  })
  test('handles FEATURE_ON with initial state', () => {
    const action = enableExperimentalFeature(experimentalFeatureSelfName)
    const nextState = reducer(
      { [experimentalFeatureSelfName]: { on: false } },
      action
    )
    expect(nextState[experimentalFeatureSelfName].on).toEqual(true)
  })
  test('handles FEATURE_OFF with initial state', () => {
    const action = disableExperimentalFeature(experimentalFeatureSelfName)
    const nextState = reducer(
      { [experimentalFeatureSelfName]: { on: true } },
      action
    )
    expect(nextState[experimentalFeatureSelfName].on).toEqual(false)
  })
  test('stips non existing features from state on initialization', () => {
    // Given
    const action = {
      type: APP_START
    }
    const stateFromLocalStorage = {
      nonExistingFeature: {
        on: true
      },
      [experimentalFeatureSelfName]: {
        on: false
      }
    }
    const expectedState = {
      ...initialState,
      [experimentalFeatureSelfName]: {
        ...initialState[experimentalFeatureSelfName],
        on: false
      }
    }

    // When
    const nextState = reducer(stateFromLocalStorage, action)

    // Then
    expect(nextState).toEqual(expectedState)
  })
})

describe('Selectors', () => {
  test('getExperimentalFeatures returns all features', () => {
    // Given
    const action = enableExperimentalFeature(experimentalFeatureSelfName)

    // When
    const nextState = reducer(
      {
        ...initialState,
        [experimentalFeatureSelfName]: {
          ...initialState[experimentalFeatureSelfName],
          on: false
        }
      },
      action
    )
    const combinedState = { [NAME]: nextState }
    const shouldBeAll = getExperimentalFeatures(combinedState)

    // Then
    expect(shouldBeAll).toEqual(initialState)
  })
  test('showFeature returns a features "on" state', () => {
    // Given
    const action = enableExperimentalFeature(experimentalFeatureSelfName)

    // When
    const nextState = reducer(
      {
        ...initialState,
        [experimentalFeatureSelfName]: {
          ...initialState[experimentalFeatureSelfName],
          on: false
        }
      },
      action
    )
    const combinedState = { [NAME]: nextState }
    const shouldBeAll = showFeature(combinedState, experimentalFeatureSelfName)

    // Then
    expect(shouldBeAll).toEqual(true)
  })
})
