export function listQueriesProcedure () {
  return 'CALL dbms.listQueries'
}

export function killQueriesProcedure (queryIdList) {
  return 'CALL dbms.killQueries([' + queryIdList.map(q => '"' + q + '"').join() + '])'
}
