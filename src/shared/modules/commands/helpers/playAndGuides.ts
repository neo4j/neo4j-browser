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
import remote from 'services/remote'
import { cleanHtml } from 'services/remoteUtils'
import { hostIsAllowed } from 'services/utils'

export const fetchRemoteGuideAsync = async (
  url: string,
  allowlistStr?: string
): Promise<string> => {
  return new Promise<void>((resolve, reject) => {
    if (!hostIsAllowed(url, allowlistStr)) {
      return reject(
        new Error('Hostname is not allowed according to server allowlist')
      )
    }
    resolve()
  }).then(() =>
    remote
      .get(url, { pragma: 'no-cache', 'cache-control': 'no-cache' })
      .then(r => {
        return cleanHtml(r)
      })
  )
}
