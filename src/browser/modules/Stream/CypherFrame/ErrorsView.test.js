/*
 * Copyright (c) 2002-2019 "Neo4j, Inc"
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

/* global describe, test, expect */

import React from 'react'
import { render } from 'react-testing-library'

import { ErrorsView, ErrorsStatusbar } from './ErrorsView'

describe('ErrorsViews', () => {
  describe('ErrorsView', () => {
    test('displays nothing if no errors', () => {
      // Given
      const props = {
        result: {}
      }

      // When
      const { container } = render(<ErrorsView {...props} />)

      // Then
      expect(container).toMatchSnapshot()
    })
    test('does displays an error', () => {
      // Given
      const props = {
        result: {
          code: 'Test.Error',
          message: 'Test error description'
        }
      }

      // When
      const { container } = render(<ErrorsView {...props} />)

      // Then
      expect(container).toMatchSnapshot()
    })
    test('displays procedure link if unknown procedure', () => {
      // Given
      const procErrorCode = 'Neo.ClientError.Procedure.ProcedureNotFound'
      const props = {
        result: {
          code: procErrorCode,
          message: 'not found'
        }
      }

      // When
      const { container, getByText } = render(<ErrorsView {...props} />)

      // Then
      expect(container).toMatchSnapshot()
      expect(getByText('List available procedures')).not.toBeUndefined()
    })
  })
  describe('ErrorsStatusbar', () => {
    test('displays nothing if no error', () => {
      // Given
      const props = {
        result: {}
      }

      // When
      const { container } = render(<ErrorsStatusbar {...props} />)
      expect(container).toMatchSnapshot()
    })
    test('displays error', () => {
      // Given
      const props = {
        result: {
          code: 'Test.Error',
          message: 'Test error description'
        }
      }

      // When
      const { container } = render(<ErrorsStatusbar {...props} />)
      expect(container).toMatchSnapshot()
    })
  })
})
