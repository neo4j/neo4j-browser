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

import React from 'react'
import { render } from '@testing-library/react'
import neo4j from 'neo4j-driver'

import { TableView, TableStatusbar, renderObject } from './TableView'

describe('TableViews', () => {
  describe('TableView', () => {
    test('displays bodyMessage if no rows', () => {
      // Given
      const sps = jest.fn()
      const props = {
        setParentState: sps,
        result: {
          records: [],
          summary: {
            resultAvailableAfter: neo4j.int(5),
            resultConsumedAfter: neo4j.int(5)
          }
        }
      }

      // When
      const { container } = render(<TableView {...props} />)

      // Then
      expect(container).toMatchSnapshot()
    })
    test('does not display bodyMessage if rows', () => {
      // Given
      const sps = jest.fn()
      const result = {
        records: [{ keys: ['x'], _fields: ['y'], get: () => 'y' }],
        summary: {
          resultAvailableAfter: neo4j.int(5),
          resultConsumedAfter: neo4j.int(5)
        }
      }

      // When
      const { container } = render(
        <TableView setParentState={sps} result={result} />
      )

      // Then
      expect(container).toMatchSnapshot()
    })
    test('renderObject handles null values', () => {
      // Given
      const datas = [{ x: 1 }, null]

      // When
      const results = datas.map(data => renderObject(data))

      // Then
      results.forEach((res, i) => expect(res).toMatchSnapshot())
    })
  })
  describe('TableStatusbar', () => {
    test('displays no statusBarMessage', () => {
      // Given
      const props = { result: {}, maxRows: 0 }

      // When
      const { container } = render(<TableStatusbar {...props} />)

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
      const { container } = render(<TableStatusbar {...props} />)

      // Then
      expect(container).toMatchSnapshot()
    })
  })
})
