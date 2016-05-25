export function recordsToTableArray (records, intChecker, intConverter) {
  const recordValues = records.map((record) => {
    let out = []
    record.forEach((val, key) => out.push(itemIntToString(val, intChecker, intConverter)))
    return out
  })
  const keys = records[0].keys
  return [[...keys], ...recordValues]
}

export function itemIntToString (item, intChecker, intConverter) {
  if (intChecker(item)) return intConverter(item)
  if (Array.isArray(item)) return arrayIntToString(item, intChecker, intConverter)
  if (['number', 'string', 'boolean'].indexOf(typeof item) !== -1) return item
  if (item === null) return item
  if (typeof item === 'object') return objIntToString(item, intChecker, intConverter)
}

export function arrayIntToString (arr, intChecker, intConverter) {
  return arr.map((item) => itemIntToString(item, intChecker, intConverter))
}

export function objIntToString (obj, intChecker, intConverter) {
  Object.keys(obj).forEach((key) => {
    obj[key] = itemIntToString(obj[key], intChecker, intConverter)
  })
  return obj
}
