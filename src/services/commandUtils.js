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

export function parseConfigInput (str) {
  const settingString = splitStringOnFirst(str, ' ')
  const setting = splitStringOnFirst(settingString[1], ':')
  if (setting.length < 2 || setting[1].length < 1) return false
  const toBeSet = JSON.parse('{"' + setting[0].replace(/"/g, '') + '":' + setting[1] + '}')
  return toBeSet
}
