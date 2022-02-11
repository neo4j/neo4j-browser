import { render } from '@testing-library/react'
import React from 'react'

import { ErrorsStatusbar } from './ErrorsStatusbar'
import { BrowserError } from 'services/exceptions'

describe('ErrorsStatusbar', () => {
  test('displays nothing if no error', () => {
    // Given
    const props = {
      result: null
    }

    // When
    const { container } = render(<ErrorsStatusbar {...props} />)
    expect(container).toMatchSnapshot()
  })
  test('displays error', () => {
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
    const { container } = render(<ErrorsStatusbar {...props} />)
    expect(container).toMatchSnapshot()
  })
})
