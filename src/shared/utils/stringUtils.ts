export const upperFirst = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export const toKeyString = (str: string): string => {
  return str.replace(/[^a-zA-Z0-9]/g, '_')
}

export const isMac = (): boolean => {
  return navigator.platform.toUpperCase().indexOf('MAC') >= 0
} 