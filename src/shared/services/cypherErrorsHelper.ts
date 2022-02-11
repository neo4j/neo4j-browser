import { BrowserError } from 'services/exceptions'

export const isUnknownProcedureError = ({ code }: BrowserError): boolean =>
  code === 'Neo.ClientError.Procedure.ProcedureNotFound'

export const isNoDbAccessError = ({ code, message }: BrowserError): boolean =>
  code === 'Neo.ClientError.Security.Forbidden' &&
  /Database access is not allowed/i.test(message)

const isCallInTransactionError = ({ code, message }: BrowserError) =>
  code === 'Neo.DatabaseError.Statement.ExecutionFailed' &&
  /in an implicit transaction/.test(message)

const isPeriodicCommitError = ({ code, message }: BrowserError) =>
  code === 'Neo.ClientError.Statement.SemanticError' &&
  [
    /in an open transaction is not possible/i,
    /tried to execute in an explicit transaction/i
  ].some(reg => reg.test(message))

export const isImplicitTransactionError = (error: BrowserError): boolean =>
  isPeriodicCommitError(error) || isCallInTransactionError(error)

export const isParameterMissingError = ({ code }: BrowserError): boolean =>
  code === 'Neo.ClientError.Statement.ParameterMissing'
