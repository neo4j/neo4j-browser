/*
 * Copyright (c) 2002-2020 "Neo4j,"
 * Neo4j Sweden AB [http://neo4j.com]
 * This file is part of Neo4j.
 * Neo4j is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

import React from 'react'
import '@testing-library/jest-dom/extend-expect'
import { render, fireEvent } from '@testing-library/react'
import { createStore } from 'redux'
import { Provider } from 'react-redux'

import { AutoExecButtonNoBus } from './auto-exec-button'

const send = jest.fn()

// credit: https://testing-library.com/docs/example-react-redux
const initialState = { settings: { cmdchar: ':' } }
const store = createStore(() => initialState, initialState)

function renderWithRedux(ui) {
  return render(<Provider store={store}>{ui}</Provider>)
}

describe('AutoExecButton', function() {
  beforeEach(() => {
    jest.resetAllMocks()
  })
  test('should display command with cmd char', () => {
    // Given
    const { getByText } = renderWithRedux(
      <AutoExecButtonNoBus bus={{ send }} cmd="help params" />
    )

    // Then
    expect(getByText(':help params')).toBeInTheDocument()
    expect(send).not.toHaveBeenCalled()
  })

  test('should auto execute when clicked', () => {
    // Given
    const { getByText } = renderWithRedux(
      <AutoExecButtonNoBus bus={{ send }} cmd="help params" />
    )

    fireEvent.click(getByText(':help params'))

    // Then
    expect(getByText(':help params')).toBeInTheDocument()
    expect(send).toHaveBeenCalledTimes(1)
    expect(send).toHaveBeenCalledWith('commands/COMMAND_QUEUED', {
      cmd: ':help params',
      id: undefined,
      parentId: undefined,
      requestId: undefined,
      type: 'commands/COMMAND_QUEUED',
      isRerun: false
    })
  })

  test('supports any random cmd string', () => {
    // Given
    const { getByText } = renderWithRedux(
      <AutoExecButtonNoBus bus={{ send }} cmd="foo bar" />
    )

    fireEvent.click(getByText(':foo bar'))

    // Then
    expect(getByText(':foo bar')).toBeInTheDocument()
    expect(send).toHaveBeenCalledTimes(1)
    expect(send).toHaveBeenCalledWith('commands/COMMAND_QUEUED', {
      cmd: ':foo bar',
      id: undefined,
      parentId: undefined,
      requestId: undefined,
      type: 'commands/COMMAND_QUEUED',
      isRerun: false
    })
  })
})
