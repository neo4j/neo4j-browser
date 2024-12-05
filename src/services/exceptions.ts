export const ErrorType = {
  Error: 'error',
  Warning: 'warning',
  Info: 'info'
} as const

export type ErrorTypes = typeof ErrorType[keyof typeof ErrorType]

export interface BrowserError {
  type: ErrorTypes
  code: string
  message: string
} 