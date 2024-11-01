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
import { createBus, createReduxMiddleware } from 'suber'
import configureMockStore, { MockStoreEnhanced } from 'redux-mock-store'
import {
  PREVIEW_EVENT,
  trackNavigateToPreview,
  trackPageLoad
} from './previewDuck'

describe('previewDuck tests', () => {
  let store: MockStoreEnhanced<unknown, unknown>
  const bus = createBus()
  const mockStore = configureMockStore([createReduxMiddleware(bus)])

  beforeAll(() => {
    store = mockStore()
  })

  afterEach(() => {
    bus.reset()
    store.clearActions()
    localStorage.clear()
  })

  test('trackNavigateToPreview sends a PREVIEW_EVENT', done => {
    const action = trackNavigateToPreview()

    bus.take(PREVIEW_EVENT, () => {
      // Then
      const [action] = store.getActions()
      expect(action).toEqual({
        type: PREVIEW_EVENT,
        label: 'PREVIEW_UI_SWITCH',
        data: {
          switchedTo: 'preview',
          timeSinceLastSwitch: null
        }
      })
      done()
    })

    // When
    store.dispatch(action)
  })

  test('trackNavigateToPreview sets hasTriedPreviewUI', done => {
    localStorage.setItem('hasTriedPreviewUI', 'false')
    const action = trackNavigateToPreview()

    bus.take(PREVIEW_EVENT, () => {
      // Then
      const hasTriedPreviewUI = localStorage.getItem('hasTriedPreviewUI')
      expect(hasTriedPreviewUI).toBe('true')
      done()
    })

    // When
    store.dispatch(action)
  })

  test('trackNavigateToPreview sends correct timeSinceLastSwitch when timeSinceLastSwitchMs is unset', done => {
    const action = trackNavigateToPreview()

    bus.take(PREVIEW_EVENT, () => {
      // Then
      const [action] = store.getActions()
      expect(action.data.timeSinceLastSwitch).toBeNull()
      done()
    })

    // When
    store.dispatch(action)
  })

  test('trackNavigateToPreview sends correct timeSinceLastSwitch when timeSinceLastSwitchMs has been set', done => {
    localStorage.setItem('timeSinceLastSwitchMs', Date.now().toString())
    const action = trackNavigateToPreview()

    bus.take(PREVIEW_EVENT, () => {
      // Then
      const [action] = store.getActions()
      expect(action.data.timeSinceLastSwitch).not.toBeNull()
      done()
    })

    // When
    store.dispatch(action)
  })

  test('trackPageLoad sends a PREVIEW_EVENT', done => {
    const action = trackPageLoad()

    bus.take(PREVIEW_EVENT, () => {
      // Then
      const [action] = store.getActions()
      expect(action).toEqual({
        type: PREVIEW_EVENT,
        label: 'PREVIEW_PAGE_LOAD',
        data: { previewUI: false, hasTriedPreviewUI: false }
      })
      done()
    })

    // When
    store.dispatch(action)
  })

  test('trackPageLoad sends correct hasTriedPreviewUI value when flag is unset', done => {
    const action = trackPageLoad()

    bus.take(PREVIEW_EVENT, () => {
      // Then
      const [action] = store.getActions()
      expect(action.data.hasTriedPreviewUI).toBeFalsy()
      done()
    })

    // When
    store.dispatch(action)
  })

  test('trackPageLoad sends correct hasTriedPreviewUI value when flag is set', done => {
    localStorage.setItem('hasTriedPreviewUI', 'true')
    const action = trackPageLoad()

    bus.take(PREVIEW_EVENT, () => {
      // Then
      const [action] = store.getActions()
      expect(action.data.hasTriedPreviewUI).toBeTruthy()
      done()
    })

    // When
    store.dispatch(action)
  })
})
