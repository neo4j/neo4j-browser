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
import nock from 'nock'

import * as config from './config'
import dbMetaReducer, {
  ClientSettings,
  initialClientSettings,
  updateSettings
} from 'shared/modules/dbMeta/dbMetaDuck'
import { replace, update } from 'shared/modules/settings/settingsDuck'

function FetchError(message: any) {
  // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
  this.name = 'FetchError'
  // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
  this.message = message
}
FetchError.prototype = Object.create(Error.prototype)
FetchError.prototype.constructor = FetchError

describe('commandsDuck config helper', () => {
  const metaSettings: ClientSettings = {
    ...initialClientSettings,
    remoteContentHostnameAllowlist: 'okurl.com'
  }
  const store = {
    getState: () => {
      return {
        meta: {
          settings: metaSettings
        }
      }
    }
  }
  beforeAll(() => {
    nock.disableNetConnect()
    if (!nock.isActive()) {
      nock.activate()
    }
  })
  afterEach(() => {
    nock.cleanAll()
  })
  afterAll(() => {
    nock.restore()
  })
  test('fails on :config x x x and shows error hint', () => {
    // Given
    const action = { cmd: ':config x x x: 2' }
    const put = jest.fn()

    // When
    const p = config.handleUpdateConfigCommand(action, put, store)

    // Then
    return expect(p)
      .rejects.toEqual(
        new Error(
          'Could not parse input. Usage: `:config "x": 2`. SyntaxError: Expected ":" but "x" found.'
        )
      )
      .then(() => expect(put).not.toHaveBeenCalled())
  })
  test('handles :config "x": 2 and calls the update action creator', () => {
    // Given
    const action = { cmd: ':config "x": 2' }
    const put = jest.fn()

    // When
    const p = config.handleUpdateConfigCommand(action, put, store)

    // Then
    return p.then(res => {
      expect(res).toEqual({ x: 2 })
      expect(put).toHaveBeenCalledWith(update({ x: 2 } as any))
    })
  })
  test('handles :config x: 2 and calls the update action creator', () => {
    // Given
    const action = { cmd: ':config x: 2' }
    const put = jest.fn()

    // When
    const p = config.handleUpdateConfigCommand(action, put, store)

    // Then
    return p.then(res => {
      expect(res).toEqual({ x: 2 })
      expect(put).toHaveBeenCalledWith(update({ x: 2 } as any))
    })
  })
  test('handles :config "x y": 2 and calls the update action creator', () => {
    // Given
    const action = { cmd: ':config "x y": 2' }
    const put = jest.fn()

    // When
    const p = config.handleUpdateConfigCommand(action, put, store)

    // Then
    return p.then(res => {
      expect(res).toEqual({ 'x y': 2 })
      expect(put).toHaveBeenCalledWith(update({ 'x y': 2 } as any))
    })
  })
  test('handles :config {"hej": "ho", "let\'s": "go"} and calls the replace action creator', () => {
    // Given
    const action = { cmd: ':config {"hej": "ho", "let\'s": "go"}' }
    const put = jest.fn()

    // When
    const p = config.handleUpdateConfigCommand(action, put, store)

    // Then
    return p.then(res => {
      expect(res).toEqual({ hej: 'ho', "let's": 'go' })
      expect(put).toHaveBeenCalledWith(
        replace({ hej: 'ho', "let's": 'go' } as any)
      )
    })
  })
  test('handles :config {x: 1, y: 2} and calls the replace action creator', () => {
    // Given
    const action = { cmd: ':config {x: 1, y: 2}' }
    const put = jest.fn()

    // When
    const p = config.handleUpdateConfigCommand(action, put, store)

    // Then
    return p.then(res => {
      expect(res).toEqual({ x: 1, y: 2 })
      expect(put).toHaveBeenCalledWith(replace({ x: 1, y: 2 } as any))
    })
  })
  test('rejects hostnames not in allowlist', () => {
    // Given
    const action = { cmd: ':config https://bad.com/cnf.json' }
    const put = jest.fn()

    // When
    const p = config.handleUpdateConfigCommand(action, put, store)

    // Then
    return expect(p)
      .rejects.toEqual(
        new Error('Hostname is not allowed according to server allowlist')
      )
      .then(() => expect(put).not.toHaveBeenCalled())
  })
  test('handles :config https://okurl.com/cnf.json and calls the replace action creator', () => {
    // Given
    const json = JSON.stringify({ x: 1, y: 'hello' })
    nock('https://okurl.com').get('/cnf.json').reply(200, json)
    const action = { cmd: ':config https://okurl.com/cnf.json' }
    const put = jest.fn()

    // When
    const p = config.handleUpdateConfigCommand(action, put, store)

    // Then
    return p.then(res => {
      expect(res).toEqual(JSON.parse(json))
      expect(put).toHaveBeenCalledWith(replace(JSON.parse(json)))
    })
  })
  test('indicates error parsing remote content', () => {
    // Given
    const json = 'no json'
    nock('https://okurl.com').get('/cnf.json').reply(200, json)
    const action = { cmd: ':config https://okurl.com/cnf.json' }
    const put = jest.fn()

    // When
    const p = config.handleUpdateConfigCommand(action, put, store)

    // Then
    return expect(p)
      .rejects.toEqual(
        new Error(
          // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
          new FetchError(
            'invalid json response body at https://okurl.com/cnf.json reason: Unexpected token o in JSON at position 1'
          )
        )
      )
      .then(() => expect(put).not.toHaveBeenCalled())
  })
})
