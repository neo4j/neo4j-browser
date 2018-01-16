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

import { CodeView, CodeStatusbar } from './CodeView'

describe('CodeViews', () => {
  describe('CodeView', () => {
    test('displays nothing if not successful query', () => {
      // we get no info from driver
      // Given
      const result = mount(CodeView)
        .withProps({ request: { status: 'error' } })
        // Then
        .then(wrapper => {
          expect(wrapper.text()).toEqual('')
        })

      // Return test result (promise)
      return result
    })
    test('displays request and response info if successful query', () => {
      // Given
      const data = {
        query: 'MATCH xx0',
        request: {
          status: 'success',
          result: {
            summary: {
              server: {
                version: 'xx1',
                address: 'xx2'
              }
            },
            records: [{ res: 'xx3' }, { res: 'xx4' }, { res: 'xx5' }]
          }
        }
      }
      const result = mount(CodeView)
        .withProps(data)
        // Then
        .then(wrapper => {
          const text = wrapper.text()
          expect(text).toContain('xx0')
          expect(text).toContain('xx1')
          expect(text).toContain('xx2')
          expect(text).toContain('xx3')
          expect(text).toContain('xx4')
          expect(text).toContain('xx5')
        })

      // Return test result (promise)
      return result
    })
  })
  describe('CodeStatusbar', () => {
    test('displays statusBarMessage', () => {
      // Given
      const statusBarMessage = 'My message'
      const result = mount(CodeStatusbar)
        .withProps({ result: {}, maxRows: 0 })
        // Then
        .then(wrapper => {
          wrapper.setState({ statusBarMessage })
          wrapper.update()
          expect(wrapper.text()).toContain('My message')
        })

      // Return test result (promise)
      return result
    })
  })
})
