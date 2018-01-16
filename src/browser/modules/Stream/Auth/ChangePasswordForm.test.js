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

/* global describe, beforeEach, afterEach, test, expect */
import { mount } from 'services/testUtils'
import ChangePasswordForm from './ChangePasswordForm'

describe('ChangePasswordForm', () => {
  test('should render when no props are passed', () => {
    // Given
    const result = mount(ChangePasswordForm)
      // When
      .withProps({})
      .then(wrapper => {
        expect(wrapper.length).toBe(1)
      })
    return result
  })
  test('should render children when passed as props', () => {
    // Given
    const children = <span className='child'>foo</span>
    const result = mount(ChangePasswordForm)
      // When
      .withProps({ children })
      .then(wrapper => {
        expect(wrapper.html()).toContain('<span class="child">foo</span>')
      })
    return result
  })
})
