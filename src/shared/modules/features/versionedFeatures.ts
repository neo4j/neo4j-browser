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
import semver from 'semver'

import { getUseDb } from '../connections/connectionsDuck'
import { getActiveDbName, getRawVersion } from '../dbMeta/dbMetaDuck'
import { guessSemverVersion } from './featureDuck.utils'
import { GlobalState } from 'project-root/src/shared/globalState'

const NEO4J_4_0 = '4.0.0-alpha01'
const NEO4J_5_0 = '5.0.0-alpha01'

export const FIRST_MULTI_DB_SUPPORT = NEO4J_4_0
// Keep the following as 3.4.0 as 3.5.X has a
// compatible bolt server.
export const FIRST_NO_MULTI_DB_SUPPORT = '3.4.0'

export const getShowCurrentUserProcedure = (serverVersion: string) => {
  const serverVersionGuessed = guessSemverVersion(serverVersion)

  const pre4 = 'CALL dbms.security.showCurrentUser()'
  if (!semver.valid(serverVersionGuessed)) {
    return pre4
  }
  if (serverVersionGuessed && semver.gte(serverVersionGuessed, NEO4J_4_0)) {
    return 'CALL dbms.showCurrentUser()'
  }
  return pre4
}

export const getDbClusterRole = (state: GlobalState) => {
  const pre4 = 'CALL dbms.cluster.role() YIELD role'
  const serverVersion = guessSemverVersion(getRawVersion(state))
  if (!semver.valid(serverVersion)) {
    return pre4
  }
  if (serverVersion && semver.gte(serverVersion, NEO4J_5_0)) {
    const db = getUseDb(state)
    return `SHOW DATABASES YIELD role, name WHERE name = "${db}"`
  }
  if (serverVersion && semver.gte(serverVersion, NEO4J_4_0)) {
    const db = getUseDb(state)
    return `CALL dbms.cluster.role("${db}") YIELD role`
  }
  return pre4
}

export const hasMultiDbSupport = (state: GlobalState) => {
  const serverVersion = guessSemverVersion(getRawVersion(state))
  if (!semver.valid(serverVersion)) {
    return false
  }
  if (serverVersion && semver.gte(serverVersion, NEO4J_4_0)) {
    return true
  }
  return false
}

export const getUsedDbName = (state: GlobalState) => {
  const serverVersion = guessSemverVersion(getRawVersion(state))
  if (!semver.valid(serverVersion)) {
    return undefined
  }
  if (serverVersion && semver.gte(serverVersion, NEO4J_4_0)) {
    return getUseDb(state)
  }
  return getActiveDbName(state)
}

export const getDefaultBoltScheme = (serverVersion: string | null) => {
  const serverVersionGuessed = guessSemverVersion(serverVersion)
  const pre4 = 'bolt://'
  if (!semver.valid(serverVersionGuessed)) {
    return pre4
  }
  if (serverVersionGuessed && semver.gte(serverVersionGuessed, NEO4J_4_0)) {
    return 'neo4j://'
  }
  return pre4
}

export const changeUserPasswordQuery = (state: any, oldPw: any, newPw: any) => {
  const pre4 = {
    query: 'CALL dbms.security.changePassword($password)',
    parameters: { password: newPw }
  }
  const serverVersion = guessSemverVersion(getRawVersion(state))
  if (!semver.valid(serverVersion)) {
    return pre4
  }
  if (serverVersion && semver.gte(serverVersion, NEO4J_4_0)) {
    return {
      query: 'ALTER CURRENT USER SET PASSWORD FROM $oldPw TO $newPw',
      parameters: { oldPw, newPw }
    }
  }
  return pre4
}

export const driverDatabaseSelection = (state: GlobalState, database: any) => {
  const pre4 = undefined
  const serverVersion = guessSemverVersion(getRawVersion(state))
  if (!semver.valid(serverVersion)) {
    return pre4
  }
  if (serverVersion && semver.gte(serverVersion, NEO4J_4_0)) {
    return { database }
  }
  return pre4
}
