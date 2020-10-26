export const isUnknownProcedureError = ({ code }) =>
  code === 'Neo.ClientError.Procedure.ProcedureNotFound'

export const isNoDbAccessError = ({ code, message }) =>
  code === 'Neo.ClientError.Security.Forbidden' &&
  /Database access is not allowed/i.test(message)

export const isPeriodicCommitError = ({ code, message }) =>
  code === 'Neo.ClientError.Statement.SemanticError' &&
  /in an open transaction is not possible/i.test(message)
