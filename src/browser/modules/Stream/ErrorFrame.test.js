/*
 * Copyright (c) 2002-2018 "Neo4j, Inc"
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

import { mount } from 'services/testUtils'

import { ErrorView } from './ErrorFrame'

describe('ErrorFrame', () => {
  test('displays UndefinedError if no error specified', async () => {
    // Given
    const result = mount(ErrorView)
      .withProps({ frame: {} })
      // Then
      .then(wrapper => {
        expect(wrapper.text()).toContain('UndefinedError')
      })

    // Return test result (promise)
    return result
  })
  test('does display an error if info provided', () => {
    // Given
    const result = mount(ErrorView)
      .withProps({
        frame: {
          error: {
            code: 'Test.Error',
            message: 'Test error description'
          }
        }
      })
      // Then
      .then(wrapper => {
        const text = wrapper.text()
        expect(text).toContain('ERROR')
        expect(text).toContain('Test.Error')
        expect(text).toContain('Test error description')
      })

    // Return test result (promise)
    return result
  })
  test('does display a known error if only code provided', () => {
    // Given
    const result = mount(ErrorView)
      .withProps({
        frame: {
          error: {
            code: 'UnknownCommandError',
            cmd: ':unknown-command' // Needed to build error msg
          },
          cmd: ':unknown-command'
        }
      })
      // Then
      .then(wrapper => {
        const text = wrapper.text()
        expect(text).toContain('ERROR')
        expect(text).toContain('UnknownCommandError')
        expect(text).toContain(':unknown-command')
      })

    // Return test result (promise)
    return result
  })
})