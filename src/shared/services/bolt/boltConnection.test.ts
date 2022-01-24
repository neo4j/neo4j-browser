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
import { validateConnection } from './boltConnection'

describe('validateConnection', () => {
  it('should reject if driver is `null`', () => {
    // validate can be called before driver is in store, which used to result in a `TypeError: Cannot read property 'supportsMultiDb' of null` error,
    // reject if driver is null is a fix to not have that error in console
    const driver = null
    const resolve = jest.fn()
    const reject = jest.fn()

    validateConnection(driver, resolve, reject)

    expect(resolve).not.toHaveBeenCalled()
    expect(reject).toHaveBeenCalled()
  })
})
