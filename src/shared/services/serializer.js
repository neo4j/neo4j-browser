const csvDelimiter = ','
const csvNewline = '\n'

const csvEscape = (str) => {
  if (!isString(str)) return str
  if (isEmptyString(str)) return '""'
  if (hasQuotes(str) || hasDelimiterChars(str)) return '"' + str.replace(/"/g, '""') + '"'
  return str
}
const serializeObject = (input) => isObject(input) ? JSON.stringify(input) : input

const hasDelimiterChars = (str) => str && str.indexOf(csvDelimiter) > -1
const hasQuotes = (str) => str && str.indexOf('"') > -1
const isString = (str) => typeof str === 'string'
const isObject = (str) => typeof str === 'object' && str !== null
const isEmpty = (str) => typeof str === 'undefined' || str === null
const isEmptyString = (str) => str === ''

const csvChain = (input) => (Array.isArray(input) ? input : [])
  .map(serializeObject)
  .map(csvEscape)
  .join(csvDelimiter)

export const CSVSerializer = (cols) => {
  const _cols = cols
  let _data = []
  const append = (row) => {
    const emptyRowInOneCol = isEmpty(row) && _cols.length === 1
    if (emptyRowInOneCol) return _data.push(row)
    if (!row || row.length !== _cols.length) throw new Error('Column number mismatch')
    _data.push(row)
  }
  return {
    append,
    appendRows: (rows) => rows.forEach(append),
    output: () =>
      csvChain(_cols) +
      (
        !_data.length ? '' : csvNewline + _data.map(csvChain).join(csvNewline)
      )
  }
}
