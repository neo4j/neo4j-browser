export const isUnknownProcedureError = ({ code }) =>
  code === 'Neo.ClientError.Procedure.ProcedureNotFound'

export const isNoDbAccessError = ({ code, message }) =>
  code === 'Neo.ClientError.Security.Forbidden' &&
  /Database access is not allowed/i.test(message)
