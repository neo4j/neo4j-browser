const BoltConnectionErrors = [
  'ServiceUnavailable',
  'Neo.ClientError.Security.AuthenticationRateLimit',
  'Neo.ClientError.Security.Unauthorized',
  'Neo.ClientError.Security.CredentialsExpired',
  'Neo.ClientError.Security.TokenExpired'
]

export const isBoltConnectionErrorCode = (code: any) =>
  BoltConnectionErrors.includes(code)
