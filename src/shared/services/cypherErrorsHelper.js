export const isUnknownProcedureError = ({ code }) =>
  code === 'Neo.ClientError.Procedure.ProcedureNotFound'
