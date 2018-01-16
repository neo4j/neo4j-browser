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

import { ErrorsView, ErrorsStatusbar } from './ErrorsView'

describe('ErrorsViews', () => {
  describe('ErrorsView', () => {
    test('displays nothing if no errors', () => {
      // Given
      const result = mount(ErrorsView)
        .withProps({ result: {} })
        // Then
        .then(wrapper => {
          expect(wrapper.text()).toEqual('')
        })

      // Return test result (promise)
      return result
    })
    test('does displays an error', () => {
      // Given
      const result = mount(ErrorsView)
        .withProps({
          result: {
            code: 'Test.Error',
            message: 'Test error description'
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
    test('displays procedure link if unknown procedure', () => {
      // Given
      const procErrorCode = 'Neo.ClientError.Procedure.ProcedureNotFound'
      const result = mount(ErrorsView)
        .withProps({
          result: {
            code: procErrorCode,
            message: 'not found'
          }
        })
        // Then
        .then(wrapper => {
          const text = wrapper.text()
          expect(text).toContain('ERROR')
          expect(text).toContain(procErrorCode)
          expect(text).toContain('not found')
          expect(text).toContain('List available procedures')
        })

      // Return test result (promise)
      return result
    })
  })
  describe('ErrorsStatusbar', () => {
    test('displays nothing if no error', () => {
      // Given
      const result = mount(ErrorsStatusbar)
        .withProps({ result: {} })
        // Then
        .then(wrapper => {
          expect(wrapper.text()).toEqual('')
        })

      // Return test result (promise)
      return result
    })
    test('displays error', () => {
      // Given
      const result = mount(ErrorsStatusbar)
        .withProps({
          result: {
            code: 'Test.Error',
            message: 'Test error description'
          }
        })
        // Then
        .then(wrapper => {
          expect(wrapper.text()).toContain('Test.Error')
          expect(wrapper.text()).toContain('Test error description')
          expect(wrapper.html()).toContain('exclamation-triangle')
        })

      // Return test result (promise)
      return result
    })
  })
})
