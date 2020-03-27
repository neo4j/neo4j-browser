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
  DISABLE_IMPLICIT_INIT_COMMANDS,
  NAME,
  UPDATE,
  REPLACE,
  shouldReportUdc,
  getInitCmd
} from './settingsDuck'
import { dehydrate } from 'services/duckUtils'

describe('settings reducer', () => {
  test('handles initial value', () => {
    const nextState = dehydrate(reducer(undefined, { type: '' }))
    expect(nextState.cmdchar).toEqual(':')
  })

  test('handles UPDATE without initial state', () => {
    const action = {
      type: UPDATE,
      state: {
        greeting: 'hello'
      }
    }
    const nextState = reducer(undefined, action)
    expect(nextState.greeting).toEqual('hello')
  })

  test('handles UPDATE', () => {
    const initialState = { cmdchar: ':', greeting: 'hello', type: 'human' }
    const action = {
      type: UPDATE,
      state: {
        greeting: 'woff',
        type: 'dog'
      }
    }
    const nextState = dehydrate(reducer(initialState, action))
    expect(nextState.cmdchar).toEqual(':')
    expect(nextState.greeting).toEqual('woff')
    expect(nextState.type).toEqual('dog')
  })
  test('handles REPLACE', () => {
    const initialState = { greeting: 'hello', type: 'human' }
    const action = {
      type: REPLACE,
      state: {
        new: 'conf'
      }
    }
    const nextState = dehydrate(reducer(initialState, action))
    expect(nextState.greeting).toBeUndefined()
    expect(nextState.type).toBeUndefined()
    expect(nextState).toMatchSnapshot()
  })

  it('defaults playImplicitInitCommands to true', () => {
    expect(reducer(undefined, { type: 'dummy action' })).toEqual(
      expect.objectContaining({ playImplicitInitCommands: true })
    )
  })

  it('sets playImplicitInitCommands to false on DISABLE_IMPLICIT_INIT_COMMANDS', () => {
    expect(
      reducer(undefined, { type: DISABLE_IMPLICIT_INIT_COMMANDS })
    ).toEqual(expect.objectContaining({ playImplicitInitCommands: false }))
  })
})

describe('Selectors', () => {
  test('shouldReportUdc casts to true for anything not false', () => {
    // Given
    const tests = [
      { test: true, expect: true },
      { test: 1, expect: true },
      { test: '1', expect: true },
      { test: 'on', expect: true },
      { test: null, expect: true },
      { test: undefined, expect: true },
      { test: false, expect: false }
    ]

    // When && Then
    tests.forEach(t => {
      const state = {
        [NAME]: { shouldReportUdc: t.test }
      }
      expect(shouldReportUdc(state)).toEqual(t.expect)
    })
  })
  test("let getInitCmd be falsy and cast to empty string if that's the case", () => {
    // Given
    const tests = [
      { test: ':play start', expect: ':play start' },
      { test: null, expect: '' },
      { test: undefined, expect: '' },
      { test: '', expect: '' },
      { test: ' ', expect: '' },
      {
        test: '//Todays number is:\nRETURN rand()',
        expect: '//Todays number is:\nRETURN rand()'
      }
    ]

    // When && Then
    tests.forEach(t => {
      const state = {
        [NAME]: { initCmd: t.test }
      }
      expect(getInitCmd(state)).toEqual(t.expect)
    })
  })
})
