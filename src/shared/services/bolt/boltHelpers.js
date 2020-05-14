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

/* global location */
import { getUrlInfo } from 'services/utils'

export const KERBEROS = 'KERBEROS'
export const NATIVE = 'NATIVE'
export const NO_AUTH = 'NO_AUTH'

export const getDiscoveryEndpoint = url => {
  const info = getUrlInfo(url || 'http://localhost:7474/')
  return `${info.protocol}//${info.host}/`
}

export const isConfigValTruthy = val =>
  [true, 'true', 'yes', 1, '1'].indexOf(val) > -1
export const isConfigValFalsy = val =>
  [false, 'false', 'no', 0, '0'].indexOf(val) > -1

export const buildTxFunctionByMode = session => {
  if (!session) {
    return null
  }
  return session._mode !== 'READ'
    ? session.writeTransaction.bind(session)
    : session.readTransaction.bind(session)
}
