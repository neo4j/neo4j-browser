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

import nock from 'nock'
import * as config from './config'
import { update, replace } from 'shared/modules/settings/settingsDuck'

function FetchError(message) {
  this.name = 'FetchError'
  this.message = message
}
FetchError.prototype = Object.create(Error.prototype)
FetchError.prototype.constructor = FetchError

describe('commandsDuck config helper', () => {
  const store = {
    getState: () => {
      return {
        meta: {
          settings: {
            'browser.remote_content_hostname_whitelist': 'okurl.com'
          }
        }
      }
    }
  }
  afterEach(() => {
    nock.cleanAll()
  })
  test('fails on :config x x x and shows error hint', () => {
    // Given
    const action = { cmd: ':config x x x: 2' }
    const cmdchar = ':'
    const put = jest.fn()

    // When
    const p = config.handleUpdateConfigCommand(action, cmdchar, put, store)

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
    const cmdchar = ':'
    const put = jest.fn()

    // When
    const p = config.handleUpdateConfigCommand(action, cmdchar, put, store)

    // Then
    return p.then(res => {
      expect(res).toEqual({ x: 2 })
      expect(put).toHaveBeenCalledWith(update({ x: 2 }))
    })
  })
  test('handles :config x: 2 and calls the update action creator', () => {
    // Given
    const action = { cmd: ':config x: 2' }
    const cmdchar = ':'
    const put = jest.fn()

    // When
    const p = config.handleUpdateConfigCommand(action, cmdchar, put, store)

    // Then
    return p.then(res => {
      expect(res).toEqual({ x: 2 })
      expect(put).toHaveBeenCalledWith(update({ x: 2 }))
    })
  })
  test('handles :config "x y": 2 and calls the update action creator', () => {
    // Given
    const action = { cmd: ':config "x y": 2' }
    const cmdchar = ':'
    const put = jest.fn()

    // When
    const p = config.handleUpdateConfigCommand(action, cmdchar, put, store)

    // Then
    return p.then(res => {
      expect(res).toEqual({ 'x y': 2 })
      expect(put).toHaveBeenCalledWith(update({ 'x y': 2 }))
    })
  })
  test('handles :config {"hej": "ho", "let\'s": "go"} and calls the replace action creator', () => {
    // Given
    const action = { cmd: ':config {"hej": "ho", "let\'s": "go"}' }
    const cmdchar = ':'
    const put = jest.fn()

    // When
    const p = config.handleUpdateConfigCommand(action, cmdchar, put, store)

    // Then
    return p.then(res => {
      expect(res).toEqual({ hej: 'ho', "let's": 'go' })
      expect(put).toHaveBeenCalledWith(replace({ hej: 'ho', "let's": 'go' }))
    })
  })
  test('handles :config {x: 1, y: 2} and calls the replace action creator', () => {
    // Given
    const action = { cmd: ':config {x: 1, y: 2}' }
    const cmdchar = ':'
    const put = jest.fn()

    // When
    const p = config.handleUpdateConfigCommand(action, cmdchar, put, store)

    // Then
    return p.then(res => {
      expect(res).toEqual({ x: 1, y: 2 })
      expect(put).toHaveBeenCalledWith(replace({ x: 1, y: 2 }))
    })
  })
  test('rejects hostnames not in whitelist', () => {
    // Given
    const action = { cmd: ':config https://bad.com/cnf.json' }
    const cmdchar = ':'
    const put = jest.fn()

    // When
    const p = config.handleUpdateConfigCommand(action, cmdchar, put, store)

    // Then
    return expect(p)
      .rejects.toEqual(
        new Error('Hostname is not allowed according to server whitelist')
      )
      .then(() => expect(put).not.toHaveBeenCalled())
  })
  test('handles :config https://okurl.com/cnf.json and calls the replace action creator', () => {
    // Given
    const json = JSON.stringify({ x: 1, y: 'hello' })
    nock('https://okurl.com')
      .get('/cnf.json')
      .reply(200, json)
    const action = { cmd: ':config https://okurl.com/cnf.json' }
    const cmdchar = ':'
    const put = jest.fn()

    // When
    const p = config.handleUpdateConfigCommand(action, cmdchar, put, store)

    // Then
    return p.then(res => {
      expect(res).toEqual(JSON.parse(json))
      expect(put).toHaveBeenCalledWith(replace(JSON.parse(json)))
    })
  })
  test('indicates error parsing remote content', () => {
    // Given
    const json = 'no json'
    nock('https://okurl.com')
      .get('/cnf.json')
      .reply(200, json)
    const action = { cmd: ':config https://okurl.com/cnf.json' }
    const cmdchar = ':'
    const put = jest.fn()

    // When
    const p = config.handleUpdateConfigCommand(action, cmdchar, put, store)

    // Then
    return expect(p)
      .rejects.toEqual(
        new Error(
          new FetchError(
            'invalid json response body at https://okurl.com/cnf.json reason: Unexpected token o in JSON at position 1'
          )
        )
      )
      .then(() => expect(put).not.toHaveBeenCalled())
  })
})
