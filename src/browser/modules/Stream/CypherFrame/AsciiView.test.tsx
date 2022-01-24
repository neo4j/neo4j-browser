/*
 * Copyright (c) "Neo4j"
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
import { render } from '@testing-library/react'
import neo4j from 'neo4j-driver'
import React from 'react'

import {
  AsciiStatusbarComponent as AsciiStatusbar,
  AsciiViewComponent as AsciiView
} from './AsciiView'

describe('AsciiViews', () => {
  describe('AsciiView', () => {
    test('displays bodyMessage if no rows', () => {
      // Given
      const sps = jest.fn()
      const result: any = {
        records: [],
        summary: {
          resultAvailableAfter: neo4j.int(5),
          resultConsumedAfter: neo4j.int(5)
        }
      }

      // When
      const { container } = render(
        <AsciiView
          setAsciiMaxColWidth={sps}
          result={result}
          maxRows={5}
          maxFieldItems={5}
        />
      )

      // Then
      expect(container).toMatchSnapshot()
    })
    test('does not display bodyMessage if rows', () => {
      // Given
      const sps = jest.fn()
      const result: any = {
        records: [{ keys: ['x'], _fields: ['y'], get: () => 'y' }],
        summary: {
          resultAvailableAfter: neo4j.int(5),
          resultConsumedAfter: neo4j.int(5)
        }
      }

      // When
      const { container } = render(
        <AsciiView
          setAsciiMaxColWidth={sps}
          result={result}
          maxRows={5}
          maxFieldItems={5}
        />
      )

      // Then
      expect(container).toMatchSnapshot()
    })
  })
  describe('AsciiStatusbar', () => {
    test('displays statusBarMessage if no rows', () => {
      // Given
      const sps = jest.fn()
      const result: any = {
        records: [],
        summary: {
          resultAvailableAfter: neo4j.int(5),
          resultConsumedAfter: neo4j.int(5)
        }
      }

      // When
      const { container } = render(
        <AsciiStatusbar
          setAsciiSetColWidth={sps}
          result={result}
          maxRows={5}
          maxFieldItems={5}
        />
      )

      // Then
      expect(container).toMatchSnapshot()
    })
    test('displays statusBarMessage if no rows', () => {
      // Given
      const sps = jest.fn()
      const result: any = {
        records: [{ keys: ['x'], _fields: ['y'], get: () => 'y' }],
        summary: {
          resultAvailableAfter: neo4j.int(5),
          resultConsumedAfter: neo4j.int(5)
        }
      }

      // When
      const { container } = render(
        <AsciiStatusbar
          setAsciiSetColWidth={sps}
          result={result}
          maxRows={5}
          maxFieldItems={5}
        />
      )

      // Then
      expect(container).toMatchSnapshot()
    })
  })
})
