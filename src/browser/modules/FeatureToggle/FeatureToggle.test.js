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
import { render, waitForElement } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'

import FeatureToggle from './FeatureToggle'
import { FeatureToggleProvider } from './FeatureToggleProvider'

const On = () => {
  return <h1>Yes</h1>
}
const Off = () => {
  return <h1>No</h1>
}

class ErrorB extends React.Component {
  state = {
    error: ''
  }

  componentDidCatch(e) {
    this.setState({ error: e })
  }

  render() {
    if (!this.state.error) {
      return this.props.children
    }
    return <span data-testid="error">{this.state.error.toString()}</span>
  }
}

describe('FeatureToggle', () => {
  test('shows features when theres no context provider available', () => {
    const { getByText, queryByText } = render(
      <FeatureToggle name="testFeature" on={<On />} off={<Off />} />
    )

    // Then
    expect(getByText('Yes')).not.toBeUndefined()
    expect(queryByText('No')).toBeNull()
  })
  test('shows "on" features when context says so', () => {
    // Given
    const features = { testFeature: { on: true } }

    const { getByText, queryByText } = render(
      <FeatureToggleProvider features={features}>
        <FeatureToggle name="testFeature" on={<On />} off={<Off />} />
      </FeatureToggleProvider>
    )

    // Then
    expect(getByText('Yes')).not.toBeUndefined()
    expect(queryByText('No')).toBeNull()
  })
  test('shows "off" features when context says so', () => {
    // Given
    const features = { testFeature: { on: false } }

    const { getByText, queryByText } = render(
      <FeatureToggleProvider features={features}>
        <FeatureToggle name="testFeature" on={<On />} off={<Off />} />
      </FeatureToggleProvider>
    )

    // Then
    expect(getByText('No')).not.toBeUndefined()
    expect(queryByText('Yes')).toBeNull()
  })
  test('returns null if no "off" prop is availavle', () => {
    // Given
    const features = { testFeature: { on: false } }

    const { queryByText } = render(
      <FeatureToggleProvider features={features}>
        <FeatureToggle name="testFeature" on={<On />} />
      </FeatureToggleProvider>
    )
    // Then

    expect(queryByText('Yes')).toBeNull()
    expect(queryByText('No')).toBeNull()
  })
  test('throws if no "on" prop is available but the feature is to be shown', async () => {
    // Given
    const oldConsoleError = console.error
    console.error = () => {}

    const features = { testFeature: { on: true } }

    // When
    const { getByTestId } = render(
      <ErrorB>
        <FeatureToggleProvider features={features}>
          <FeatureToggle name="testFeature" off={<Off />} />
        </FeatureToggleProvider>
      </ErrorB>
    )

    // Wait for error propagation
    await waitForElement(() => getByTestId('error'))

    // Then
    expect(getByTestId('error')).toHaveTextContent(
      'No "on" property available for this enabled feature: testFeature for FeatureToggle component.'
    )

    console.error = oldConsoleError
  })
  test('throws if no "name" property provided', async () => {
    // Given
    const oldConsoleError = console.error
    console.error = () => {}

    const features = { testFeature: { on: true } }

    // When
    const { getByTestId } = render(
      <ErrorB>
        <FeatureToggleProvider features={features}>
          <FeatureToggle on={<On />} off={<Off />} />
        </FeatureToggleProvider>
      </ErrorB>
    )

    // Wait for error propagation
    await waitForElement(() => getByTestId('error'))

    // Then
    expect(getByTestId('error')).toHaveTextContent(
      'No "name" property provided to FeatureToggle component.'
    )

    console.error = oldConsoleError
  })
})
