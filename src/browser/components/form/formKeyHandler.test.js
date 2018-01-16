/*
 * Copyright (c) 2002-2018 "Neo4j, Inc"
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

import FormKeyHandler from './formKeyHandler'

describe('formKeyHandler', () => {
  test('should register submit action when specified in constructor', () => {
    const submitAction = 'foobar'
    const formKeyHandler = new FormKeyHandler(submitAction)
    expect(formKeyHandler.submitAction).toEqual(submitAction)
  })
  test('should re-register submit action when specified in registerSubmit function', () => {
    const submitAction = 'foo'
    const otherSubmitAction = 'bar'
    const formKeyHandler = new FormKeyHandler(submitAction)

    expect(formKeyHandler.submitAction).toEqual(submitAction)

    formKeyHandler.registerSubmit(otherSubmitAction)
    expect(formKeyHandler.submitAction).toEqual(otherSubmitAction)
  })
  test('should register input element with submit action', () => {
    const submitAction = 'foo'
    const input = <span>bar</span>
    const position = 0
    const formKeyHandler = new FormKeyHandler(submitAction)

    formKeyHandler.registerInput(input, position)
    expect(formKeyHandler.elements[0]).toEqual(input)
  })
})
