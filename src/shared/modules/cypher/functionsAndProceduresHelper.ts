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

import { gte, SemVer } from 'semver'
export const getListProcedureQuery = (version: SemVer | null): string => {
  const versionOrFallback = version ?? '5.0.0'
  return gte(versionOrFallback, '5.0.0')
    ? 'SHOW PROCEDURES yield name, description, signature'
    : 'CALL dbms.procedures()'
}

export const getListFunctionQuery = (version: SemVer | null): string => {
  const versionOrFallback = version ?? '5.0.0'
  return gte(versionOrFallback, '5.0.0')
    ? 'SHOW FUNCTIONS yield name, description, signature'
    : 'CALL dbms.functions()'
}
