import bolt from 'services/bolt/bolt'

function callProcedure (query, callback) {
  return bolt.transaction(query).then((r) => {
    return callback(r)
  }).catch((_) => { })
}

export function getListOfUsersWithRole (callBack) {
  return callProcedure('CALL dbms.security.listUsers', callBack)
}
export function getListOfRolesWithUsers (callBack) {
  return callProcedure('CALL dbms.security.listRoles YIELD role', callBack)
}
export function createDatabaseUser ({username, password, forcePasswordChange}, callBack) {
  return callProcedure(`CALL dbms.security.createUser("${username}", "${password}", ${forcePasswordChange})`, callBack)
}
export function deleteUser (username, callBack) {
  return callProcedure(`CALL dbms.security.deleteUser("${username}")`, callBack)
}
export function addRoleToUser (username, role, callBack) {
  return callProcedure(`CALL dbms.security.addRoleToUser("${role}", "${username}")`, callBack)
}
export function removeRoleFromUser (role, username, callBack) {
  return callProcedure(`CALL dbms.security.removeRoleFromUser("${role}", "${username}")`, callBack)
}
