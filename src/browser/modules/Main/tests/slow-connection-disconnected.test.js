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
 *
 */

import { act, renderHook } from '@testing-library/react-hooks'
import mockDate from 'mockdate'

import { DISCONNECTED_STATE } from 'shared/modules/connections/connectionsDuck'

import { useSlowConnectionState } from '../main.hooks'

mockDate.set(0)
jest.useFakeTimers()

describe('main.hooks', () => {
  afterAll(() => {
    mockDate.reset()
  })

  describe('DISCONNECTED_STATE', () => {
    beforeAll(() => {
      mockDate.set(0)
    })

    const initialProps = {
      connectionState: DISCONNECTED_STATE,
      lastConnectionUpdate: 0
    }
    const { result, rerender } = renderHook(useSlowConnectionState, {
      initialProps
    })

    test('should default to [false, false]', () => {
      expect(result.current).toEqual([false, false])
    })

    test('after a rerender with same props, should continue to return [false, false]', () => {
      rerender(initialProps)
      expect(result.current).toEqual([false, false])
    })

    test('after a rerender with updated props, should continue to return [false, false]', () => {
      rerender({ ...initialProps, lastConnectionUpdate: 1 })
      expect(result.current).toEqual([false, false])
    })

    test('after 6000ms, should continue to return [false, false]', () => {
      act(() => {
        mockDate.set(6000)
        jest.advanceTimersByTime(6000)

        expect(result.current).toEqual([false, false])
      })
    })

    test('after 12000ms, should continue to return [false, false]', () => {
      act(() => {
        mockDate.set(12000)
        jest.advanceTimersByTime(6000)

        expect(result.current).toEqual([false, false])
      })
    })
  })
})
