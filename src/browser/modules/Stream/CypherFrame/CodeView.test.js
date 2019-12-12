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
import neo4j from 'neo4j-driver'

import {
  CodeViewComponent as CodeView,
  CodeStatusbarComponent as CodeStatusbar
} from './CodeView'

describe('CodeViews', () => {
  describe('CodeView', () => {
    test('displays nothing if not successful query', () => {
      // Given
      const props = { request: { status: 'error' } }

      // When
      const { container } = render(<CodeView {...props} />)

      // Then
      expect(container).toMatchSnapshot()
    })
    test('displays request and response info if successful query', () => {
      // Given
      const props = {
        query: 'MATCH xx0',
        request: {
          status: 'success',
          result: {
            summary: {
              server: {
                version: 'xx1',
                address: 'xx2'
              }
            },
            records: [{ res: 'xx3' }]
          }
        }
      }

      // When
      const { container } = render(<CodeView {...props} />)

      // Then
      expect(container).toMatchSnapshot()
    })
  })
  describe('CodeStatusbar', () => {
    test('displays no statusBarMessage', () => {
      // Given
      const props = { result: {}, maxRows: 0 }

      // When
      const { container } = render(<CodeStatusbar {...props} />)

      // Then
      expect(container).toMatchSnapshot()
    })
    test('displays statusBarMessage', () => {
      // Given
      const props = {
        query: 'MATCH xx0',
        status: 'success',
        result: {
          summary: {
            resultAvailableAfter: neo4j.int(5),
            resultConsumedAfter: neo4j.int(5)
          },
          maxRows: 100,
          records: [{ res: 'xx3' }]
        }
      }

      // When
      const { container } = render(<CodeStatusbar {...props} />)

      // Then
      expect(container).toMatchSnapshot()
    })
  })
})
