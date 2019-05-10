/*
 * Copyright (c) 2002-2019 "Neo4j,"
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

import semver from 'semver'
import { getVersion } from '../dbMeta/dbMetaDuck'

const NEO4J_TX_METADATA_VERSION = '3.5.0-alpha01'
const NEO4J_4_0 = '4.0.0-alpha01'

export const canSendTxMetadata = state => {
  const serverVersion = getVersion(state)
  if (!semver.valid(serverVersion)) {
    return false
  }
  return semver.gt(serverVersion, NEO4J_TX_METADATA_VERSION)
}

export const getShowCurrentUserProcedure = state => {
  const pre4 = 'CALL dbms.security.showCurrentUser()'
  const serverVersion = getVersion(state)
  if (!semver.valid(serverVersion)) {
    return pre4
  }
  if (semver.gt(serverVersion, NEO4J_4_0)) {
    return 'CALL dbms.showCurrentUser()'
  }
  return pre4
}

export const hasMultiDbSupport = state => {
  const serverVersion = getVersion(state)
  if (!semver.valid(serverVersion)) {
    return false
  }
  if (semver.gt(serverVersion, NEO4J_4_0)) {
    return true
  }
  return false
}
