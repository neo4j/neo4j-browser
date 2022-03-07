export const deepEquals = (x: any, y: any): boolean => {
  if (x && y && typeof x === 'object' && typeof y === 'object') {
    if (Object.keys(x).length !== Object.keys(y).length) return false
    return Object.keys(x).every(key => deepEquals(x[key], y[key]))
  }
  if (typeof x === 'function' && typeof y === 'function') {
    return x.toString() === y.toString()
  }
  return x === y
}
