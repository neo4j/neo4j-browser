/*
 * Copyright (c) 2002-2017 "Neo4j, Inc,"
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

/* global test, expect, jest */

import { mount } from 'services/testUtils'
import DesktopIntegration from './index'

describe('<DesktopIntegration>', () => {
  test('does not render anything if no integration point', () => {
    // Given
    const integrationPoint = null

    // When
    const result = mount(DesktopIntegration)
      .withProps({ integrationPoint })
      // Then
      .then(wrapper => {
        expect(wrapper.text()).toEqual('')
      })

    // Return test result (promise)
    return result
  })
  test('does not render anything if there is an integration point', () => {
    // Given
    const integrationPoint = { x: true }

    // When
    const result = mount(DesktopIntegration)
      .withProps({ integrationPoint })
      // Then
      .then(wrapper => {
        expect(wrapper.text()).toEqual('')
      })

    // Return test result (promise)
    return result
  })
  test('calls onMount with data on mounting', () => {
    // Given
    const mFn = jest.fn()
    const context = {
      projects: [
        {
          graphs: [
            {
              status: 'ACTIVE',
              configuration: {
                protocols: {
                  bolt: {
                    username: 'neo4j'
                  }
                }
              }
            }
          ]
        }
      ]
    }
    const integrationPoint = { getContext: () => Promise.resolve(context) }

    // When
    const result = mount(DesktopIntegration)
      .withProps({ integrationPoint, onMount: mFn })
      // Then
      .then(wrapper => {
        expect(wrapper.text()).toEqual('')
        expect(mFn).toHaveBeenCalledTimes(1)
      })

    // Return test result (promise)
    return result
  })
})
