export const deepEquals = (x, y) => {
  if (x && y && typeof x === 'object' && typeof y === 'object') {
    if (Object.keys(x).length !== Object.keys(y).length) return false
    return Object.keys(x).every((key) => deepEquals(x[key], y[key]))
  }
  return (x === y)
}

export const moveInArray = (fromIndex, toIndex, arr) => {
  if (!Array.isArray(arr)) return false
  if (fromIndex < 0 || fromIndex >= arr.length) return false
  if (toIndex < 0 || toIndex >= arr.length) return false
  const newArr = [].concat(arr)
  const el = arr[fromIndex]
  newArr.splice(fromIndex, 1)
  newArr.splice(toIndex, 0, el)
  return newArr
}

export const debounce = (fn, time, context = null) => {
  let pending
  return (...args) => {
    if (pending) clearTimeout(pending)
    pending = setTimeout(() => typeof fn === 'function' && fn.apply(context, args), parseInt(time))
  }
}

export const isRoutingHost = (host) => {
  return /^bolt\+routing:\/\//.test(host)
}

export const toBoltHost = (host) => {
  return 'bolt://' + (host || '') // prepend with bolt://
    .split('bolt://').join('') // remove bolt://
    .split('bolt+routing://').join('') // remove bolt+routing://
}

export const hostIsAllowed = (uri, whitelist = null) => {
  if (whitelist === '*') return true
  const urlInfo = getUrlInfo(uri)
  const hostname = urlInfo.hostname
  const hostnamePlusProtocol = urlInfo.protocol + '//' + hostname

  let whitelistedHosts = ['guides.neo4j.com', 'localhost']
  if (whitelist && whitelist !== '') {
    whitelistedHosts = whitelist.split(',')
  }
  return whitelistedHosts.indexOf(hostname) > -1 ||
    whitelistedHosts.indexOf(hostnamePlusProtocol) > -1
}

export const getUrlInfo = (url) => {
  const reURLInformation = new RegExp([
    '^(?:(https?:)//)?', // protocol
    '(([^:/?#]*)(?::([0-9]+))?)', // host (hostname and port)
    '(/{0,1}[^?#]*)', // pathname
    '(\\?[^#]*|)', // search
    '(#.*|)$' // hash
  ].join(''))
  const match = url.match(reURLInformation)
  return match && {
    protocol: match[1],
    host: match[2],
    hostname: match[3],
    port: match[4],
    pathname: match[5],
    search: match[6],
    hash: match[7]
  }
}

export const getUrlParamValue = (name, url) => {
  if (!url) return false
  let out = []
  const re = new RegExp('[\\?&]' + name + '=([^&#]*)', 'g')
  let results
  while ((results = re.exec(url)) !== null) {
    if (results && results[1]) out.push(results[1])
  }
  if (!out.length) return undefined
  return out
}

export const toHumanReadableBytes = (input) => {
  let number = +input
  if (!isFinite(number)) { return '-' }

  if (number < 1024) {
    return `${number} B`
  }

  number /= 1024
  let units = ['KiB', 'MiB', 'GiB', 'TiB']

  for (let unit of Array.from(units)) {
    if (number < 1024) { return `${number.toFixed(2)} ${unit}` }
    number /= 1024
  }

  return `${number.toFixed(2)} PiB`
}

export const getBrowserName = function () {
  if (!!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0) {
    return 'Opera'
  }
  if (typeof InstallTrigger !== 'undefined') {
    return 'Firefox'
  }
  if (navigator.userAgent.match(/Version\/[\d.]+.*Safari/)) {
    return 'Safari'
  }
  if (window.chrome) {
    return 'Chrome'
  }
  if (document.documentMode) {
    return 'Internet Explorer'
  }
  if (window.StyleMedia) {
    return 'Edge'
  }
  return 'Unknown'
}

export const removeComments = (string) => {
  return string.split(/\r?\n/).filter((line) => !line.startsWith('//')).join('\r\n')
}

// Epic helpers
export const put = (dispatch) => (action) => dispatch(action)
