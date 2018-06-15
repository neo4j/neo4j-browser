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
import React from 'react'
import { render } from 'react-testing-library'
import { v1 as neo4j } from 'neo4j-driver-alias'

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
      const props = {
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

      // When
      render(<PlanView {...props} />)

      // Then
      const calls = display.mock.calls
      const callObj = calls[0][0]
      expect(callObj.root).toBeDefined()
      expect(callObj.root.DbHits).toEqual('xx0')
    })
  })
  describe('PlanStatusbar', () => {
    test('displays statusBarMessage', () => {
      // Given
      const props = {
        result: {
          summary: {
            resultAvailableAfter: neo4j.int(100),
            resultConsumedAfter: neo4j.int(20),
            profile: {
              children: [],
              arguments: {
                operatorType: {},
                version: 'xx0',
                planner: 'xx1',
                runtime: 'xx2',
                children: []
              },
              dbHits: 'xx3'
            }
          }
        }
      }

      // When
      const { container } = render(<PlanStatusbar {...props} />)

      // Then
      expect(container).toMatchSnapshot()
    })
  })
})
