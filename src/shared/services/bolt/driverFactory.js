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

import neo4j from 'neo4j-driver'

export const createDriverOrFailFn = (url, auth, opts, failFn = () => {}) => {
  // This is needed, I haven't figured out why. I don't find any mutations to
  // the object, so not sure what's going on.
  const spreadOpts = { ...opts }
  try {
    const res = neo4j.driver(url, auth, spreadOpts)
    return res
  } catch (e) {
    failFn(e)
    return null
  }
}
