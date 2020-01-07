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

import { formatDocVersion } from './Documents'

test('formatDocVersion', () => {
  const tests = [
    { test: null, expect: 'current' },
    { test: undefined, expect: 'current' },
    { test: true, expect: 'current' },
    { test: false, expect: 'current' },
    { test: '', expect: 'current' },
    { test: '1.1.0', expect: '1.1' },
    { test: '1.1.0-beta01', expect: '1.1-preview' },
    { test: '1.1.2', expect: '1.1' },
    { test: '2.1.10', expect: '2.1' }
  ]

  tests.forEach(t => expect(formatDocVersion(t.test)).toEqual(t.expect))
})
