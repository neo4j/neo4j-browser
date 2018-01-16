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

import React from 'react'
import { mount } from 'services/testUtils'

import Display from './Display'

describe('<Display>', () => {
  test('does not render if condition is false and lazy is set', () => {
    // Given
    const val = false
    const children = [<span>Hello</span>]
    const result = mount(Display)
      .withProps({ if: val, lazy: 1, children })
      // Then
      .then(wrapper => {
        expect(wrapper.text()).toEqual('')
      })

    // Return test result (promise
    return result
  })
  test('does render if condition is false but lazy isnt set', () => {
    // Given
    const val = false
    const children = [<span>Hello</span>]
    const result = mount(Display)
      .withProps({ if: val, children })
      // Then
      .then(wrapper => {
        expect(wrapper.text()).toEqual('Hello')
        expect(wrapper.html()).toContain('display: none')
      })

    // Return test result (promise)
    return result
  })
  test('does render and display if condition is true', () => {
    // Given
    const val = true
    const children = [<span>Hello</span>]
    const result = mount(Display)
      .withProps({ if: val, children })
      // Then
      .then(wrapper => {
        expect(wrapper.text()).toEqual('Hello')
        expect(wrapper.html()).toContain('display: block')
      })

    // Return test result (promise)
    return result
  })
  test('can render as inline', () => {
    // Given
    const val = true
    const children = [<span>Hello</span>]
    const result = mount(Display)
      .withProps({ if: val, inline: 1, children })
      // Then
      .then(wrapper => {
        expect(wrapper.text()).toEqual('Hello')
        expect(wrapper.html()).toContain('display: inline')
      })

    // Return test result (promise)
    return result
  })
  test('lazy loads', () => {
    // Given
    const firstVal = false
    const secondVal = true
    const children = [<span>Hello</span>]
    const result = mount(Display)
      .withProps({ if: firstVal, lazy: 1, children })
      // Then
      .then(wrapper => {
        expect(wrapper.text()).toEqual('')
        return wrapper
      })
      .then(wrapper => {
        wrapper.setProps({ if: secondVal, lazy: 1, children })
        wrapper.update()
        expect(wrapper.text()).toEqual('Hello')
        expect(wrapper.html()).toContain('display: block')
      })

    // Return test result (promise)
    return result
  })
  test('hides when condition becomes false', () => {
    // Given
    const children = [<span>Hello</span>]
    const result = mount(Display)
      .withProps({ if: false, lazy: 1, children })
      // Then
      .then(wrapper => {
        expect(wrapper.text()).toEqual('')
        return wrapper
      })
      .then(wrapper => {
        wrapper.setProps({ if: true, lazy: 1, children })
        wrapper.update()
        expect(wrapper.text()).toEqual('Hello')
        expect(wrapper.html()).toContain('display: block')
        return wrapper
      })
      .then(wrapper => {
        wrapper.setProps({ if: false, lazy: 1, children })
        wrapper.update()
        expect(wrapper.text()).toEqual('Hello')
        expect(wrapper.html()).toContain('display: none')
      })

    // Return test result (promise)
    return result
  })
})
