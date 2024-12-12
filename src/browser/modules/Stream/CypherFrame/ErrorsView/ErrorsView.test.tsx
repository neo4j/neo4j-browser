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
import { createBus } from 'suber'

import { ErrorsView, ErrorsViewProps } from './ErrorsView'
import { BrowserError } from 'services/exceptions'
import { Provider } from 'react-redux'
import { initialState as initialMetaState } from 'shared/modules/dbMeta/dbMetaDuck'
import { initialState as initialSettingsState } from 'shared/modules/settings/settingsDuck'

const withProvider = (store: any, children: any) => {
  return <Provider store={store}>{children}</Provider>
}

const mount = (props: Partial<ErrorsViewProps>, state?: any) => {
  const defaultProps: ErrorsViewProps = {
    result: null,
    bus: createBus(),
    params: {},
    executeCmd: jest.fn(),
    setEditorContent: jest.fn(),
    neo4jVersion: null,
    gqlErrorsEnabled: true
  }

  const combinedProps = {
    ...defaultProps,
    ...props
  }

  const initialState = {
    meta: initialMetaState,
    settings: initialSettingsState
  }

  const combinedState = { ...initialState, ...state }

  const store = {
    subscribe: () => {},
    dispatch: () => {},
    getState: () => ({
      ...combinedState
    })
  }

  return render(withProvider(store, <ErrorsView {...combinedProps} />))
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

  test('does display an error', () => {
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

  test('does display an error for gql status codes', () => {
    // Given
    const error: BrowserError = {
      code: 'Test.Error',
      message: 'Test error description',
      type: 'Neo4jError',
      gqlStatus: '22N14',
      gqlStatusDescription:
        "error: data exception - invalid temporal value combination. Cannot select both epochSeconds and 'datetime'.",
      cause: undefined
    }

    const props = {
      result: error
    }

    const state = {
      meta: {
        server: {
          version: '5.26.0'
        }
      },
      settings: {
        enableGqlErrorsAndNotifications: true
      }
    }

    // When
    const { container } = mount(props, state)

    // Then
    expect(container).toMatchSnapshot()
  })

  test('does display a nested error for gql status codes', () => {
    // Given
    const error: BrowserError = {
      code: 'Test.Error',
      message: 'Test error description',
      type: 'Neo4jError',
      gqlStatus: '42N51',
      gqlStatusDescription:
        'error: syntax error or access rule violation - invalid parameter. Invalid parameter $`param`. ',
      cause: {
        gqlStatus: '22G03',
        gqlStatusDescription: 'error: data exception - invalid value type',
        cause: {
          gqlStatus: '22N27',
          gqlStatusDescription:
            "error: data exception - invalid entity type. Invalid input '******' for $`param`. Expected to be STRING.",
          cause: undefined
        }
      }
    }

    const props = {
      result: error
    }

    const state = {
      meta: {
        server: {
          version: '5.26.0'
        }
      },
      settings: {
        enableGqlErrorsAndNotifications: true
      }
    }

    // When
    const { container } = mount(props, state)

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
