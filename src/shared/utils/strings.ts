export const capitalize = (s: string): string =>
  s.charAt(0).toUpperCase() + s.slice(1)

export const isNonEmptyString = (s: unknown): s is string =>
  typeof s === 'string' && s !== ''
