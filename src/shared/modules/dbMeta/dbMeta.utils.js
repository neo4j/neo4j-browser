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

export function extractServerInfo(res) {
  const serverInfo = {
    version: 'unknown',
    edition: ''
  }

  if (!res) {
    return serverInfo
  }

  // Always get server version
  if (res.summary.server.version) {
    if (res.summary.server.version.includes('/')) {
      serverInfo.version = res.summary.server.version.split('/').pop()
    } else {
      serverInfo.version = res.summary.server.version
    }
  }

  // Get server edition if available
  if (res.records.length && res.records[0].keys.includes('edition')) {
    serverInfo.edition = res.records[0].get('edition')
  }

  // Temporarily hardcoded solution for Aura
  if (serverInfo.version === '4.0-aura') {
    serverInfo.version = '4.0.0'
    serverInfo.edition = 'aura'
  }

  return serverInfo
}
