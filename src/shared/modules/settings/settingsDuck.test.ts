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
import reducer, {
  DISABLE_IMPLICIT_INIT_COMMANDS,
  NAME,
  REPLACE,
  UPDATE,
  cleanSettingsFromStorage,
  getInitCmd,
  initialState
} from './settingsDuck'
import { dehydrate } from 'services/duckUtils'

describe('settings reducer', () => {
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
    const initialState: any = { greeting: 'hello', type: 'human' }
    const action = {
      type: UPDATE,
      state: {
        greeting: 'woff',
        type: 'dog'
      }
    }
    const nextState = dehydrate(reducer(initialState, action))
    expect(nextState.greeting).toEqual('woff')
    expect(nextState.type).toEqual('dog')
  })
  test('handles REPLACE', () => {
    const initialState: any = { greeting: 'hello', type: 'human' }
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

describe('loading settings from localstorage', () => {
  it('handles missing values', () => {
    expect(cleanSettingsFromStorage(undefined)).toEqual(initialState)
  })
  it('handles malformed and missing values', () => {
    const test = {
      ...initialState,
      allowCrashReports: undefined,
      initCmd: 324234,
      maxFrame: [],
      theme: 'non-existent',
      showPerformanceOverlay: { show: true }
    }
    expect(cleanSettingsFromStorage(test as any)).toEqual(initialState)
  })

  it('handles a handful of real life storages', () => {
    const test1 = {
      test: {
        allowCrashReports: true,
        allowUserStats: true,
        autoComplete: true,
        browserSyncDebugServer: null,
        cmdchar: ':',
        codeFontLigatures: true,
        connectionTimeout: 30000,
        editorAutocomplete: true,
        editorLint: false,
        enableMultiStatementMode: true,
        initCmd: 'MATCH (n) RETURN n',
        initialNodeDisplay: 300,
        maxFieldItems: 500,
        maxFrames: 30,
        maxHistory: 30,
        maxNeighbours: 100,
        maxRows: 1000,
        playImplicitInitCommands: true,
        scrollToTop: true,
        shouldReportUdc: true,
        showPerformanceOverlay: false,
        showSampleScripts: true,
        theme: 'auto',
        useBoltRouting: false,
        useCypherThread: true
      },
      expected: {
        allowCrashReports: true,
        allowUserStats: true,
        autoComplete: true,
        browserSyncDebugServer: null,
        // old setting cmd char dropped
        codeFontLigatures: true,
        connectionTimeout: 30000,
        // old setting editor autocomplete dropped
        editorLint: false,
        enableMultiStatementMode: true,
        initCmd: 'MATCH (n) RETURN n',
        initialNodeDisplay: 300,
        maxFieldItems: 500,
        maxFrames: 30,
        maxHistory: 30,
        maxNeighbours: 100,
        maxRows: 1000,
        playImplicitInitCommands: true,
        scrollToTop: true,
        // should report udc  - old setting dropped
        // TODO should we drop old settings? or let them linger in localstorage
        showPerformanceOverlay: false,
        showSampleScripts: true,
        theme: 'auto',
        useBoltRouting: false,
        useCypherThread: true
      }
    }

    const test2 = {
      test: {
        allowCrashReports: true,
        allowUserStats: true,
        autoComplete: true,
        browserSyncDebugServer: null,
        cmdchar: ':',
        codeFontLigatures: true,
        connectionTimeout: 30000,
        editorAutocomplete: true,
        editorLint: false,
        enableMultiStatementMode: true,
        initCmd: ':sysinfo',
        initialNodeDisplay: '600',
        maxFieldItems: 500,
        maxFrames: 30,
        maxHistory: '300',
        maxNeighbours: 100,
        maxRows: 1000,
        playImplicitInitCommands: true,
        scrollToTop: true,
        shouldReportUdc: true,
        showPerformanceOverlay: false,
        showSampleScripts: true,
        theme: 'normal',
        useBoltRouting: false,
        useCypherThread: true
      },
      expected: {
        allowCrashReports: true,
        allowUserStats: true,
        autoComplete: true,
        browserSyncDebugServer: null,
        codeFontLigatures: true,
        connectionTimeout: 30000,
        editorLint: false,
        enableMultiStatementMode: true,
        initCmd: ':sysinfo',
        initialNodeDisplay: '600', // still here and still a number
        maxFieldItems: 500,
        maxFrames: 30,
        maxHistory: '300',
        maxNeighbours: 100,
        maxRows: 1000,
        playImplicitInitCommands: true,
        scrollToTop: true,
        showPerformanceOverlay: false,
        showSampleScripts: true,
        theme: 'normal',
        useBoltRouting: false,
        useCypherThread: true
      }
    }

    const test3 = {
      test: {
        allowCrashReports: true,
        allowUserStats: true,
        autoComplete: true,
        browserSyncDebugServer: null,
        codeFontLigatures: true,
        connectionTimeout: 30000,
        editorLint: false,
        enableMultiStatementMode: true,
        initCmd: ':play start',
        initialNodeDisplay: 300,
        maxFieldItems: 500,
        maxFrames: 30,
        maxHistory: 30,
        maxNeighbours: 100,
        maxRows: 1000,
        playImplicitInitCommands: true,
        scrollToTop: true,
        shouldReportUdc: true,
        showPerformanceOverlay: false,
        showSampleScripts: true,
        theme: 'auto',
        useBoltRouting: false,
        useCypherThread: true
      },
      expected: {
        allowCrashReports: true,
        allowUserStats: true,
        autoComplete: true,
        browserSyncDebugServer: null,
        codeFontLigatures: true,
        connectionTimeout: 30000,
        editorLint: false,
        enableMultiStatementMode: true,
        initCmd: ':play start',
        initialNodeDisplay: 300,
        maxFieldItems: 500,
        maxFrames: 30,
        maxHistory: 30,
        maxNeighbours: 100,
        maxRows: 1000,
        playImplicitInitCommands: true,
        scrollToTop: true,
        showPerformanceOverlay: false,
        showSampleScripts: true,
        theme: 'auto',
        useBoltRouting: false,
        useCypherThread: true
      }
    }
    const tests = [test1, test2, test3]
    tests.forEach(({ test, expected }) =>
      expect(cleanSettingsFromStorage(test as any)).toEqual(expected)
    )
  })
})
