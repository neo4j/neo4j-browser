export const isUnknownProcedureError = ({ code }: any) =>
  code === 'Neo.ClientError.Procedure.ProcedureNotFound'

export const isNoDbAccessError = ({ code, message }: any) =>
  code === 'Neo.ClientError.Security.Forbidden' &&
  /Database access is not allowed/i.test(message)

const isCallInTransactionError = ({ code, message }: any) =>
  code === 'Neo.DatabaseError.Statement.ExecutionFailed' &&
  /in an implicit transaction/.test(message)

const isPeriodicCommitError = ({ code, message }: any) =>
  code === 'Neo.ClientError.Statement.SemanticError' &&
  [
    /in an open transaction is not possible/i,
    /tried to execute in an explicit transaction/i
  ].some(reg => reg.test(message))

export const isImplicitTransactionError = (error: any) =>
  isPeriodicCommitError(error) || isCallInTransactionError(error)
