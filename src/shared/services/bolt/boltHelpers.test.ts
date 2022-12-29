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
import { buildTxFunctionByMode } from './boltHelpers'

const WRITE = 'WRITE'
const READ = 'READ'

describe('buildTxFunctionByMode', () => {
  test('it returns WRITE tx when in WRITE mode', () => {
    // Given
    const fakeSession: any = {
      _mode: WRITE,
      readTransaction: jest.fn(),
      writeTransaction: jest.fn()
    }

    // When
    const txFn = buildTxFunctionByMode(fakeSession)
    txFn!(() => {})

    // Then
    expect(fakeSession.readTransaction).toHaveBeenCalledTimes(0)
    expect(fakeSession.writeTransaction).toHaveBeenCalledTimes(1)
  })
  test('it returns READ tx when in READ mode', () => {
    // Given
    const fakeSession: any = {
      _mode: READ,
      readTransaction: jest.fn(),
      writeTransaction: jest.fn()
    }

    // When
    const txFn = buildTxFunctionByMode(fakeSession)
    txFn!(() => {})

    // Then
    expect(fakeSession.readTransaction).toHaveBeenCalledTimes(1)
    expect(fakeSession.writeTransaction).toHaveBeenCalledTimes(0)
  })
  test('it by DEFAULT returns tx in WRITE mode', () => {
    // Given
    const fakeSession: any = {
      readTransaction: jest.fn(),
      writeTransaction: jest.fn()
    }

    // When
    const txFn = buildTxFunctionByMode(fakeSession)
    txFn!(() => {})

    // Then
    expect(fakeSession.readTransaction).toHaveBeenCalledTimes(0)
    expect(fakeSession.writeTransaction).toHaveBeenCalledTimes(1)
  })
  test('it returns null if no session passed', () => {
    // Given
    const fakeSession = undefined

    // When
    const txFn = buildTxFunctionByMode(fakeSession)

    // Then
    expect(txFn).toBeNull()
  })
})
