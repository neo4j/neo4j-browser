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

export function listUsersQuery () {
  return 'CALL dbms.security.listUsers'
}
export function listRolesQuery () {
  return 'CALL dbms.security.listRoles YIELD role'
}
export function createDatabaseUser ({
  username,
  password,
  forcePasswordChange
}) {
  return `CALL dbms.security.createUser("${username}", "${password}", ${forcePasswordChange})`
}
export function deleteUser (username) {
  return `CALL dbms.security.deleteUser("${username}")`
}
export function addRoleToUser (username, role) {
  return `CALL dbms.security.addRoleToUser("${role}", "${username}")`
}
export function removeRoleFromUser (role, username) {
  return `CALL dbms.security.removeRoleFromUser("${role}", "${username}")`
}
export function activateUser (username) {
  return `CALL dbms.security.activateUser("${username}", false)`
}
export function suspendUser (username) {
  return `CALL dbms.security.suspendUser("${username}")`
}
