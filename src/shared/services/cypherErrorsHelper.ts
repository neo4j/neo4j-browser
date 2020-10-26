export const isUnknownProcedureError = ({ code }: any) =>
  code === 'Neo.ClientError.Procedure.ProcedureNotFound'

export const isNoDbAccessError = ({ code, message }: any) =>
  code === 'Neo.ClientError.Security.Forbidden' &&
  /Database access is not allowed/i.test(message)

export const isPeriodicCommitError = ({ code, message }: any) =>
  code === 'Neo.ClientError.Statement.SemanticError' &&
  /in an open transaction is not possible/i.test(message)
