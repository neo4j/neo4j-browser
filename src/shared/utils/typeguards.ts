import { BrowserError } from 'services/exceptions'

export function isError(error: unknown): error is Error {
  return error instanceof Error
}

export function isBrowserError(error: unknown): error is BrowserError {
  return error instanceof Error && 'code' in error
}
