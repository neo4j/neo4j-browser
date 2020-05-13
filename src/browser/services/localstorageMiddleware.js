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

export const makeConnectionsInitialState = connectionsReducer => {
  return (key, val) => {
    if (key !== 'connections') return val
    const localVal = val || connectionsReducer(undefined, '')
    const out = {}
    out.allConnectionIds = [].concat(localVal.allConnectionIds)
    out.connectionsById = {
      ...localVal.connectionsById
    }
    out.activeConnection = 'offline' // Always start in offline mode

    // If offline exists, return
    if (localVal.allConnectionIds.indexOf('offline') > -1) return out

    // If not, add it
    out.allConnectionIds = ['offline'].concat(out.allConnectionIds)
    out.connectionsById = Object.assign(out.connectionsById, {
      offline: { name: 'Offline', type: 'offline', id: 'offline' }
    })
    return out
  }
}

export const makeConnectionsPersistedState = () => {
  return (key, val) => {
    if (key !== 'connections') return val
    if (!val) return val
    const out = {}
    out.allConnectionIds = [].concat(val.allConnectionIds)
    out.connectionsById = {
      ...val.connectionsById
    }
    out.activeConnection = 'offline' // To start in offline mode
    return out
  }
}
