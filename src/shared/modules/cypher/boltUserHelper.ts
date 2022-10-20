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

export function listUsersQuery(is40 = false) {
  if (is40) {
    return 'SHOW USERS'
  }

  return 'CALL dbms.security.listUsers'
}

export function listRolesQuery(is40 = false) {
  if (is40) {
    return 'SHOW ALL ROLES'
  }

  return 'CALL dbms.security.listRoles'
}
export function createDatabaseUser(
  { username, forcePasswordChange }: any,
  is40 = false
) {
  if (is40) {
    return `CREATE USER \`${username}\` SET PASSWORD $password CHANGE ${
      forcePasswordChange ? '' : 'NOT'
    } REQUIRED`
  }

  return `CALL dbms.security.createUser($username, $password, ${!!forcePasswordChange})`
}
export function deleteUser(username: any, is40 = false) {
  if (is40) {
    return `DROP USER \`${username}\``
  }

  return 'CALL dbms.security.deleteUser($username)'
}
export function addRoleToUser(username: any, role: any, is40 = false) {
  if (is40) {
    return `GRANT ROLE \`${role}\` TO \`${username}\``
  }

  return 'CALL dbms.security.addRoleToUser($role, $username)'
}
export function removeRoleFromUser(role: any, username: any, is40 = false) {
  if (is40) {
    return `REVOKE ROLE \`${role}\` FROM \`${username}\``
  }

  return 'CALL dbms.security.removeRoleFromUser($role, $username)'
}
export function activateUser(username: any, is40 = false) {
  if (is40) {
    return `ALTER USER \`${username}\` SET STATUS ACTIVE`
  }

  return 'CALL dbms.security.activateUser($username, false)'
}
export function suspendUser(username: any, is40 = false) {
  if (is40) {
    return `ALTER USER \`${username}\` SET STATUS SUSPENDED`
  }

  return 'CALL dbms.security.suspendUser($username)'
}
