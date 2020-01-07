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

import { hostIsAllowed } from 'services/utils'
import remote from 'services/remote'

export const fetchRemoteGrass = (url, whitelist = null) => {
  return new Promise((resolve, reject) => {
    if (!hostIsAllowed(url, whitelist)) {
      return reject(
        new Error('Hostname is not allowed according to server whitelist')
      )
    }
    resolve()
  }).then(() => {
    return remote.get(url).then(r => {
      return r
    })
  })
}
