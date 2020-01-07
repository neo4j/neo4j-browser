/*
 * Copyright (c) 2002-2020 "Neo4j,"
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

import React from 'react'
import { render } from '@testing-library/react'

import { WarningsView } from './WarningsView'

describe('WarningsViews', () => {
  describe('WarningsView', () => {
    test('displays nothing if no notifications', () => {
      // Given
      const props = {
        result: {}
      }

      // When
      const { container } = render(<WarningsView {...props} />)

      // Then
      expect(container).toMatchSnapshot()
    })
    test('does displays a warning', () => {
      // Given
      const props = {
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
            query: {
              text: 'EXPLAIN MATCH xx3'
            }
          }
        }
      }

      // When
      const { container } = render(<WarningsView {...props} />)

      // Then
      expect(container).toMatchSnapshot()
    })
    test('does displays multiple warnings', () => {
      // Given
      const props = {
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
            query: {
              text: 'EXPLAIN MATCH zz3'
            }
          }
        }
      }

      // When
      const { container } = render(<WarningsView {...props} />)

      // Then
      expect(container).toMatchSnapshot()
    })
  })
})
