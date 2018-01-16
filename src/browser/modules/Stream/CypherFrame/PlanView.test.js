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
import { PlanView, PlanStatusbar } from './PlanView'

describe('PlanViews', () => {
  describe('PlanView', () => {
    test('displays plan view if it exists', () => {
      // Given
      const display = jest.fn()
      global.neo = {
        queryPlan: el => {
          return {
            display
          }
        }
      }
      const data = {
        query: 'MATCH xx0',
        result: {
          summary: {
            plan: {
              dbHits: 'xx0',
              arguments: {},
              children: []
            }
          }
        }
      }
      const result = mount(PlanView)
        .withProps(data)
        // Then
        .then(wrapper => {
          const calls = display.mock.calls
          const callObj = calls[0][0]
          expect(callObj.root).toBeDefined()
          expect(callObj.root.DbHits).toEqual('xx0')
        })

      // Return test result (promise)
      return result
    })
  })
  describe('PlanStatusbar', () => {
    test('displays statusBarMessage', () => {
      // Given
      const intMock = num => {
        return {
          toNumber: () => num,
          add: intMockInput => intMock(num + intMockInput.toNumber())
        }
      }
      const results = {
        summary: {
          resultAvailableAfter: intMock(100),
          resultConsumedAfter: intMock(20)
        }
      }
      const extractedPlan = {
        root: {
          version: 'xx0',
          planner: 'xx1',
          runtime: 'xx2',
          totalDbHits: 'xx3'
        }
      }
      const result = mount(PlanStatusbar)
        .withProps({ result: results })
        // Then
        .then(wrapper => {
          wrapper.setState({ extractedPlan })
          wrapper.update()
          const text = wrapper.text()
          expect(text).toContain('xx0')
          expect(text).toContain('xx1')
          expect(text).toContain('xx2')
          expect(text).toContain('xx3')
          expect(text).toContain('120 ms')
        })

      // Return test result (promise)
      return result
    })
  })
})
