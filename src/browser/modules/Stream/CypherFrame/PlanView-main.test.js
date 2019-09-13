/*
 * Copyright (c) 2002-2019 "Neo4j,"
 * Neo4j Sweden AB [http://neo4j.com]
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
import { render } from '@testing-library/react'
import { v1 as neo4j } from 'neo4j-driver'
import { PlanStatusbar } from './PlanView'

describe('PlanViews', () => {
  describe('PlanStatusbar', () => {
    test('displays statusBarMessage', async () => {
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
      const { getByText } = render(<PlanStatusbar {...props} />)

      // Then
      expect(getByText(/xx0/))
      expect(getByText(/xx1/))
      expect(getByText(/xx2/))
      expect(getByText(/xx3/))
    })
  })
})
