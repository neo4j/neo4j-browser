export const UnauthorizedDriverError = 'Neo.ClientError.Security.Unauthorized'
export const TokenExpiredDriverError = 'Neo.ClientError.Security.TokenExpired'

const BoltConnectionErrors = [
  'ServiceUnavailable',
  'Neo.ClientError.Security.AuthenticationRateLimit',
  'Neo.ClientError.Security.CredentialsExpired',
  UnauthorizedDriverError,
  TokenExpiredDriverError
]

export const isBoltConnectionErrorCode = (code: any) =>
  BoltConnectionErrors.includes(code)
