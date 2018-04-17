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

import { WarningsView, WarningsStatusbar } from './WarningsView'

describe('WarningsViews', () => {
  describe('WarningsView', () => {
    test('displays nothing if no notifications', () => {
      // Given
      const result = mount(WarningsView)
        .withProps({ result: {} })
        // Then
        .then(wrapper => {
          expect(wrapper.text()).toEqual('')
        })

      // Return test result (promise)
      return result
    })
    test('does displays a warning', () => {
      // Given
      const result = mount(WarningsView)
        .withProps({
          result: {
            summary: {
              notifications: [
                {
                  severity: 'WARNING xx0',
                  title: 'My xx1 warning',
                  description: 'This is xx2 warning',
                  position: {
                    offset: 7,
                    line: 1
                  }
                }
              ],
              statement: {
                text: 'EXPLAIN MATCH xx3'
              }
            }
          }
        })
        // Then
        .then(wrapper => {
          const text = wrapper.text()
          expect(text).toContain('xx0')
          expect(text).toContain('xx1')
          expect(text).toContain('xx2')
          expect(text).toContain('xx3')
          expect(text).toContain('^')
          expect(text).toContain('EXPLAIN')
        })

      // Return test result (promise)
      return result
    })
    test('does displays multiple warnings', () => {
      // Given
      const result = mount(WarningsView)
        .withProps({
          result: {
            summary: {
              notifications: [
                {
                  severity: 'WARNING xx0',
                  title: 'My xx1 warning',
                  description: 'This is xx2 warning',
                  position: {
                    offset: 7,
                    line: 1
                  }
                },
                {
                  severity: 'WARNING yy0',
                  title: 'My yy1 warning',
                  description: 'This is yy2 warning',
                  position: {
                    offset: 3,
                    line: 1
                  }
                }
              ],
              statement: {
                text: 'EXPLAIN MATCH zz3'
              }
            }
          }
        })
        // Then
        .then(wrapper => {
          const text = wrapper.text()
          expect(text).toContain('xx0')
          expect(text).toContain('xx1')
          expect(text).toContain('xx2')
          expect(text).toContain('yy0')
          expect(text).toContain('yy1')
          expect(text).toContain('yy2')
          expect(text).toContain('zz3')
        })

      // Return test result (promise)
      return result
    })
  })
  describe('WarningsStatusbar', () => {
    test('displays nothing', () => {
      // Given
      const result = mount(WarningsStatusbar)
        .withProps({})
        // Then
        .then(wrapper => {
          expect(wrapper.text()).toEqual('')
        })

      // Return test result (promise)
      return result
    })
  })
})
