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
import React from 'react'
import { combineReducers, createStore } from 'redux'
import { createBus } from 'suber'

import { ErrorsView, ErrorsViewProps } from './ErrorsView'
import reducers from 'project-root/src/shared/rootReducer'
import { BrowserError } from 'services/exceptions'

const mount = (partOfProps: Partial<ErrorsViewProps>) => {
  const defaultProps: ErrorsViewProps = {
    result: null,
    bus: createBus(),
    params: {},
    executeCmd: jest.fn(),
    setEditorContent: jest.fn(),
    neo4jVersion: null
  }
  const props = {
    ...defaultProps,
    ...partOfProps
  }
  const reducer = combineReducers({ ...(reducers as any) })
  const store: any = createStore(reducer)
  return render(<ErrorsView store={store} {...props} />)
}

describe('ErrorsView', () => {
  test('displays nothing if no errors', () => {
    // Given
    const props = {
      result: null
    }

    // When
    const { container } = mount(props)

    // Then
    expect(container).toMatchSnapshot()
  })
  test('does displays an error', () => {
    // Given
    const error: BrowserError = {
      code: 'Test.Error',
      message: 'Test error description',
      type: 'Neo4jError'
    }
    const props = {
      result: error
    }

    // When
    const { container } = mount(props)

    // Then
    expect(container).toMatchSnapshot()
  })
  test('displays procedure link if unknown procedure', () => {
    // Given
    const error: BrowserError = {
      code: 'Neo.ClientError.Procedure.ProcedureNotFound',
      message: 'not found',
      type: 'Neo4jError'
    }
    const props = {
      result: error
    }

    // When
    const { container, getByText } = mount(props)

    // Then
    expect(container).toMatchSnapshot()
    expect(getByText('List available procedures')).not.toBeUndefined()
  })
  test('displays procedure link if periodic commit error', () => {
    // Given
    const error: BrowserError = {
      code: 'Neo.ClientError.Statement.SemanticError',
      message:
        'Executing queries that use periodic commit in an open transaction is not possible.',
      type: 'Neo4jError'
    }
    const props = {
      result: error
    }

    // When
    const { getByText } = mount(props)

    // Then
    // We need to split up because of the use of <code> tags in the rendered document
    expect(getByText(/info on the/i)).not.toBeUndefined()
    expect(getByText(':auto')).not.toBeUndefined()
    expect(getByText('(auto-committing transactions)')).not.toBeUndefined()
  })
})
