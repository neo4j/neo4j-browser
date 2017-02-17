export function listUsersQuery () {
  return 'CALL dbms.security.listUsers'
}
export function listRolesQuery () {
  return 'CALL dbms.security.listRoles YIELD role'
}
export function createDatabaseUser ({username, password, forcePasswordChange}) {
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
