export function cleanCommand (cmd) {
  const noComments = stripCommandComments(cmd)
  const noEmptyLines = stripEmptyCommandLines(noComments)
  return noEmptyLines
}

export function stripEmptyCommandLines (str) {
  return str.replace(/(^|\n)\s*/g, '')
}

export function stripCommandComments (str) {
  return str.replace(/((^|\n)\/\/[^\n$]+\n?)/g, '')
}

export function splitStringOnFirst (str, delimiter) {
  const parts = str.split(delimiter)
  return [].concat(parts[0], parts.slice(1).join(delimiter))
}

export function splitStringOnLast (str, delimiter) {
  const parts = str.split(delimiter)
  return [].concat(parts.slice(0, parts.length - 1).join(delimiter), parts[parts.length - 1])
}

export function extractCommandParameters (cmd, input) {
  const re = new RegExp('^[^\\w]*' + cmd + '\\s+(?:(?:`([^`]+)`)|([^:]+))\\s*(?:(?::\\s?([^$]*))?)$')
  const matches = re.exec(input)
  if (!matches) return false
  const name = matches[1] || matches[2]
  let val = matches[3]
  try {
    val = eval('(' + val + ')') // eslint-disable-line
    if (val === undefined) throw new Error('Parsing error')
  } catch (e) {
    return false
  }
  return {[name]: val}
}

export function parseCommandJSON (cmd, input) {
  const clean = input.substring(cmd.length).trim()
  if (!/^\{.*\}$/.test(clean)) return false
  let val = false
  try {
    val = eval('(' + clean + ')') // eslint-disable-line
    if (val === undefined) throw new Error('Parsing error')
  } catch (e) {
    return false
  }
  return val
}
