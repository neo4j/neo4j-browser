export const upperFirst = (str: string): string =>
  str[0].toUpperCase() + str.slice(1)

export const toKeyString = (str: any) => btoa(encodeURIComponent(str))

export const numberToUSLocale = (
  value: null | undefined | number | string
): string | null => {
  if (value === null || value === undefined) {
    return null
  }

  const n = typeof value === 'number' ? value : parseInt(value, 10)
  if (isNaN(n)) {
    return n.toString()
  }

  return n.toLocaleString('en-US')
}
