export function cleanHtml (string) {
  if (typeof string !== 'string') return string
  string = string.replace(/(\s+(on[^\s=]+)[^\s=]*\s*=\s*("[^"]*"|'[^']*'|[\w\-.:]+\s*))/ig, '')
  return string.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*(<\/script>)?/gi, '')
}
