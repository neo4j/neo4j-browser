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

import { errorMessageFormater } from './errorMessageFormater'

describe('errorsHelper', () => {
  test('should return error code as code and message when message is missing', () => {
    const errorCode = 0
    const error = errorMessageFormater(errorCode)

    expect(error.title.trim()).toEqual(errorCode.toString())
    expect(error.message.trim()).toEqual(errorCode.toString())
  })
  test('should return error code and message', () => {
    const errorCode = 0
    const errorText = 'foobar'
    const error = errorMessageFormater(errorCode, errorText)

    expect(error.title.trim()).toContain(errorCode.toString())
    expect(error.title.trim()).toContain(errorText)
    expect(error.message.trim()).toContain(errorText)
  })
  test('should only return error message when error code is missing', () => {
    const errorCode = null
    const errorText = 'foobar'
    const error = errorMessageFormater(errorCode, errorText)

    expect(error.title).toBe(errorText)
    expect(error.message).toBe(errorText)
  })
})
