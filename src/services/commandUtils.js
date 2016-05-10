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
