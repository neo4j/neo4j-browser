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
import {
  createConnectionCredentialsObject,
  getActiveGraph
} from './desktop-api.utils'

export const buildConnectionCreds = async (
  _event?: any,
  context?: any,
  _oldContext?: any,
  getKerberosTicket?: any,
  extra: any = {}
) => {
  const activeGraph = getActiveGraph(context) || {}
  const connectionsCredentialsObject = await createConnectionCredentialsObject(
    activeGraph,
    extra.defaultConnectionData,
    getKerberosTicket
  )
  // No connection. Probably no graph active.
  if (!connectionsCredentialsObject) {
    throw new Error('No connection creds found')
  }
  return connectionsCredentialsObject
}

export const getDesktopTheme = (_?: any, newContext?: any) => {
  if (newContext.global && newContext.global.prefersColorScheme) {
    return Promise.resolve(newContext.global.prefersColorScheme)
  }
  return Promise.resolve(null)
}
