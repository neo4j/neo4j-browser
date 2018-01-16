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

/* global jest, describe, test, expect */

import { mount } from 'services/testUtils'

import { AsciiView, AsciiStatusbar } from './AsciiView'

describe('AsciiViews', () => {
  describe('AsciiView', () => {
    test('displays bodyMessage if no rows', () => {
      // Given
      const sps = jest.fn()
      const bodyMessage = 'My message'
      const result = mount(AsciiView)
        .withProps({ setParentState: sps, result: {} })
        // Then
        .then(wrapper => {
          wrapper.setState({ bodyMessage })
          wrapper.update()
          expect(wrapper.text()).toContain('My message')
        })

      // Return test result (promise)
      return result
    })
    test('does not display bodyMessage if rows', () => {
      // Given
      const sps = jest.fn()
      const bodyMessage = 'My message'
      const serializedRows = [['x'], ['y']]
      const result = mount(AsciiView)
        .withProps({ setParentState: sps, result: {} })
        // Then
        .then(wrapper => {
          wrapper.setState({ bodyMessage, serializedRows })
          wrapper.update()
          expect(wrapper.text()).not.toContain('My message')
          expect(wrapper.text()).toContain('x')
        })

      // Return test result (promise)
      return result
    })
  })
  describe('AsciiStatusbar', () => {
    test('displays statusBarMessage if no rows', () => {
      // Given
      const sps = jest.fn()
      const statusBarMessage = 'My message'
      const result = mount(AsciiStatusbar)
        .withProps({ setParentState: sps, _asciiSerializedRows: undefined })
        // Then
        .then(wrapper => {
          wrapper.setState({ statusBarMessage })
          wrapper.update()
          expect(wrapper.text()).toContain('My message')
          expect(wrapper.text()).not.toContain('Max column width')
        })

      // Return test result (promise)
      return result
    })
    test('does not display statusBarMessage if rows', () => {
      // Given
      const sps = jest.fn()
      const statusBarMessage = 'My message'
      const serializedRows = [['x'], ['y']]
      const result = mount(AsciiStatusbar)
        .withProps({
          setParentState: sps,
          _asciiSerializedRows: serializedRows
        })
        // Then
        .then(wrapper => {
          wrapper.setState({ statusBarMessage })
          wrapper.update()
          expect(wrapper.text()).not.toContain('My message')
          expect(wrapper.text()).toContain('Max column width')
        })

      // Return test result (promise)
      return result
    })
  })
})
