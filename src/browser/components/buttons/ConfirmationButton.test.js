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
/* global jest */
import React from 'react'
import { render, fireEvent } from 'react-testing-library'

import { ConfirmationButton } from './ConfirmationButton'

test('ConfirmationButton renders changes state on clicks and finally calls the onConfirmed prop', () => {
  // Given
  const confimred = jest.fn()

  // When
  const { container } = render(<ConfirmationButton onConfirmed={confimred} />)

  // Then
  expect(container).toMatchSnapshot()

  // When
  const initialIcon = container.querySelector(
    `[data-testid="confirmation-button-initial"]`
  )
  fireEvent.click(initialIcon)

  // Then
  expect(container).toMatchSnapshot()

  // When
  const cancelIcon = container.querySelector(
    `[data-testid="confirmation-button-cancel"]`
  )
  fireEvent.click(cancelIcon)

  // Then
  expect(container).toMatchSnapshot()

  // When
  const initialIcon2 = container.querySelector(
    `[data-testid="confirmation-button-initial"]`
  )
  fireEvent.click(initialIcon2)
  const confirmIcon = container.querySelector(
    `[data-testid="confirmation-button-confirm"]`
  )
  fireEvent.click(confirmIcon)

  // Then
  expect(container).toMatchSnapshot()
  expect(confimred).toHaveBeenCalledTimes(1)
})
