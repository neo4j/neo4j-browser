
const addClass = (node, className) => {
  if (!((node instanceof HTMLElement) && (typeof className === 'string'))) {
    return
  }

  // normalize node class name
  var nodeClassName = ' ' + node.className + ' '
  if (nodeClassName.indexOf(' ' + className + ' ') === -1) {
    node.className += ((node.className ? ' ' : '') + className)
  }
}

export { addClass }
