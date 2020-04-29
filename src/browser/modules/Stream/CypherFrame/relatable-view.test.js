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
  RelatableViewComponent as RelatableView,
  RelatableStatusbarComponent as RelatableStatusbar
} from './relatable-view'

describe('RelatableViews', () => {
  describe('RelatableView', () => {
    test('displays bodyMessage if no rows', () => {
      // Given
      const props = {
        result: {
          records: [],
          summary: {
            resultAvailableAfter: neo4j.int(5),
            resultConsumedAfter: neo4j.int(5)
          }
        }
      }

      // When
      const { container } = render(
        <RelatableView {...props} maxFieldItems={1000} maxRows={1000} />
      )

      // Then
      expect(container).toMatchSnapshot()
    })
    test('does not display bodyMessage if rows, and escapes HTML', () => {
      const value = 'String with HTML <strong>in</strong> it'
      const result = {
        records: [{ keys: ['x'], _fields: [value], get: () => value }],
        summary: {
          resultAvailableAfter: neo4j.int(5),
          resultConsumedAfter: neo4j.int(5)
        }
      }

      // When
      const { container } = render(
        <RelatableView result={result} maxFieldItems={1000} maxRows={1000} />
      )

      // Then
      expect(container).toMatchSnapshot()
    })
  })
  describe('TableStatusbar', () => {
    test('displays no statusBarMessage', () => {
      // Given
      const props = { result: {}, maxRows: 0 }

      // When
      const { container } = render(
        <RelatableStatusbar {...props} maxFieldItems={1000} maxRows={1000} />
      )

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
      const { container } = render(
        <RelatableStatusbar {...props} maxFieldItems={1000} maxRows={1000} />
      )

      // Then
      expect(container).toMatchSnapshot()
    })
  })
})
