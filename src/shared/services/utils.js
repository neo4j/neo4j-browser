/*
 * Copyright (c) 2002-2018 "Neo4j, Inc"
 * Network Engine for Objects in Lund AB [http://neotechnology.com]
 *
 * This file is part of Neo4j.
 *
 * Neo4j is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
/* global btoa */

import parseUrl from 'url-parse'

/**
 * The work objects expected shape:
  {
    workFn,
    onSuccess = () => {},
    onError = () => {},
    onSkip = () => {}
  }
 * workFn needs to return either a resolving Promise or a truthy value
 * for the chain to continue
 */

export const serialExecution = (...args) => {
  if (!args.length) {
    return Promise.reject(Error('Nothing to do'))
  }
  let out = Promise.resolve()
  args.forEach(arg => {
    if (!arg) return
    arg.prior = out
    out = linkPromises(arg)
  })
  return out
}

const linkPromises = next => {
  if (!next || !next.workFn) {
    return Promise.reject(Error('Nothing to do'))
  }
  if (next && !next.prior) {
    return Promise.resolve()
  }
  return (
    next.prior
      // Set `catch` before `then` not to catch it's own rejection
      // so only following promises catches it
      .catch(e => {
        next.onSkip && next.onSkip()
        return Promise.reject(e) // Continue rejection chain
      })
      .then(() => {
        return new Promise((resolve, reject) => {
          next.onStart && next.onStart()
          const res = next.workFn()
          if (!res) {
            next.onError && next.onError()
            return reject(new Error('workFn failed'))
          }
          if (res && !res.then) {
            next.onSuccess && next.onSuccess(res)
            return resolve(res)
          }
          return res
            .then(r => {
              next.onSuccess && next.onSuccess(r)
              resolve(r)
            })
            .catch(e => {
              next.onError && next.onError(e)
              reject(e)
            })
        })
      })
  )
}

export const deepEquals = (x, y) => {
  if (x && y && typeof x === 'object' && typeof y === 'object') {
    if (Object.keys(x).length !== Object.keys(y).length) return false
    return Object.keys(x).every(key => deepEquals(x[key], y[key]))
  }
  return x === y
}

export const shallowEquals = (a, b) => {
  for (let key in a) if (a[key] !== b[key]) return false
  for (let key in b) if (!(key in a)) return false
  return true
}

export const flatten = arr =>
  arr.reduce((a, b) => a.concat(Array.isArray(b) ? flatten(b) : b), [])

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
    pending = setTimeout(
      () => typeof fn === 'function' && fn.apply(context, args),
      parseInt(time)
    )
  }
}

export const throttle = (fn, time, context = null) => {
  let blocking
  return (...args) => {
    if (blocking) return
    blocking = true
    typeof fn === 'function' && fn.apply(context, args)
    setTimeout(() => (blocking = false), parseInt(time))
  }
}

export const firstSuccessPromise = (list, fn) => {
  return list.reduce((promise, item) => {
    return promise.catch(() => fn(item)).then(r => Promise.resolve(r))
  }, Promise.reject(new Error()))
}

export const isRoutingHost = host => {
  return /^bolt\+routing:\/\//.test(host)
}

export const toBoltHost = host => {
  return (
    'bolt://' +
    (host || '') // prepend with bolt://
      .replace(/(.*(?=@+)@|(bolt|bolt\+routing):\/\/)/, '') // remove bolt or bolt+routing protocol and auth info
  )
}

export const hostIsAllowed = (uri, whitelist = null) => {
  if (whitelist === '*') return true
  const urlInfo = getUrlInfo(uri)
  const hostname = urlInfo.hostname
  const hostnamePlusProtocol = urlInfo.protocol + '//' + hostname
  const whitelistedHosts =
    whitelist && whitelist !== ''
      ? extractWhitelistFromConfigString(whitelist)
      : []
  return (
    whitelistedHosts.indexOf(hostname) > -1 ||
    whitelistedHosts.indexOf(hostnamePlusProtocol) > -1
  )
}

export const extractWhitelistFromConfigString = str =>
  str.split(',').map(s => s.trim().replace(/\/$/, ''))

export const addProtocolsToUrlList = list => {
  return list.reduce((all, uri) => {
    if (!uri || uri === '*') return all
    const urlInfo = getUrlInfo(uri)
    if (urlInfo.protocol) return all.concat(uri)
    return all.concat(['https://' + uri, 'http://' + uri])
  }, [])
}

export const getUrlInfo = url => {
  let protocolMissing = false

  // prepend a default protocol, if none was found
  if (url.match(/^(.+:\/\/)?/)[1] === undefined) {
    url = 'http://' + url
    protocolMissing = true
  }

  const {
    protocol,
    username,
    password,
    host,
    hostname,
    port,
    pathname,
    query: search,
    hash
  } = parseUrl(url, {})

  return {
    protocol: protocolMissing ? '' : protocol,
    username,
    password,
    host,
    hostname,
    port,
    pathname,
    search,
    hash
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

export const toHumanReadableBytes = input => {
  let number = +input
  if (!isFinite(number)) {
    return '-'
  }

  if (number < 1024) {
    return `${number} B`
  }

  number /= 1024
  let units = ['KiB', 'MiB', 'GiB', 'TiB']

  for (let unit of Array.from(units)) {
    if (number < 1024) {
      return `${number.toFixed(2)} ${unit}`
    }
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

export const removeComments = (string = '') => {
  return string
    .split(/\r?\n/)
    .filter(line => !line.startsWith('//'))
    .join('\r\n')
}

export const canUseDOM = () =>
  !!(
    typeof window !== 'undefined' &&
    window.document &&
    window.document.createElement
  )

export const ecsapeCypherMetaItem = str =>
  /^[A-Za-z][A-Za-z0-9_]*$/.test(str)
    ? str
    : '`' + str.replace(/`/g, '``') + '`'

export const parseTimeMillis = timeWithOrWithoutUnit => {
  timeWithOrWithoutUnit += '' // cast to string
  const readUnit = timeWithOrWithoutUnit.match(/\D+/)
  const value = parseInt(timeWithOrWithoutUnit)

  const unit = readUnit === undefined || readUnit === null ? 's' : readUnit[0] // Assume seconds

  switch (unit) {
    case 'ms':
      return value
    case 's':
      return value * 1000
    case 'm':
      return value * 60 * 1000
    default:
      return 0
  }
}

export const arrayToObject = array =>
  array.reduce((obj, item) => {
    const key = Object.keys(item)[0]
    const value = Object.values(item)[0]
    obj[key] = value
    return obj
  }, {})

export const stringifyMod = (
  value,
  modFn = null,
  prettyLevel = false,
  skipOpeningIndentation = false
) => {
  prettyLevel = !prettyLevel
    ? false
    : prettyLevel === true
      ? 1
      : parseInt(prettyLevel)
  const nextPrettyLevel = prettyLevel ? prettyLevel + 1 : false
  const newLine = prettyLevel ? '\n' : ''
  const indentation =
    prettyLevel && !skipOpeningIndentation ? Array(prettyLevel).join('  ') : ''
  const endIndentation = prettyLevel ? Array(prettyLevel).join('  ') : ''
  const propSpacing = prettyLevel ? ' ' : ''
  const toString = Object.prototype.toString
  const isArray =
    Array.isArray ||
    function (a) {
      return toString.call(a) === '[object Array]'
    }
  const escMap = {
    '"': '"',
    '\\': '\\',
    '\b': '\b',
    '\f': '\f',
    '\n': '\n',
    '\r': '\r',
    '\t': '\t'
  }
  const escFunc = function (m) {
    return (
      escMap[m] || '\\u' + (m.charCodeAt(0) + 0x10000).toString(16).substr(1)
    )
  }
  const escRE = /[\\"\u0000-\u001F\u2028\u2029]/g // eslint-disable-line no-control-regex
  if (modFn) {
    const modVal = modFn && modFn(value)
    if (typeof modVal !== 'undefined') return indentation + modVal
  }
  if (value == null) return indentation + 'null'
  if (typeof value === 'number') {
    return indentation + (isFinite(value) ? value.toString() : 'null')
  }
  if (typeof value === 'boolean') return indentation + value.toString()
  if (typeof value === 'object') {
    if (typeof value.toJSON === 'function') {
      return stringifyMod(value.toJSON(), modFn, nextPrettyLevel)
    } else if (isArray(value)) {
      let hasValues = false
      let res = ''
      for (let i = 0; i < value.length; i++) {
        hasValues = true
        res +=
          (i ? ',' : '') +
          newLine +
          stringifyMod(value[i], modFn, nextPrettyLevel)
      }
      return (
        indentation +
        '[' +
        res +
        (hasValues ? newLine + endIndentation : '') +
        ']'
      )
    } else if (toString.call(value) === '[object Object]') {
      let tmp = []
      for (const k in value) {
        if (value.hasOwnProperty(k)) {
          tmp.push(
            stringifyMod(k, modFn, nextPrettyLevel) +
              ':' +
              propSpacing +
              stringifyMod(value[k], modFn, nextPrettyLevel, true)
          )
        }
      }
      return (
        indentation +
        '{' +
        newLine +
        tmp.join(',' + newLine) +
        newLine +
        endIndentation +
        '}'
      )
    }
  }
  return indentation + '"' + value.toString().replace(escRE, escFunc) + '"'
}

export const safetlyAddObjectProp = (obj, prop, val) => {
  obj = escapeReservedProps(obj, prop)
  obj[prop] = val
  return obj
}

export const safetlyRemoveObjectProp = (obj, prop) => {
  if (!hasReservedProp(obj, prop)) {
    return obj
  }
  delete obj[prop]
  obj = unEscapeReservedProps(obj, prop)
  return obj
}

export const escapeReservedProps = (obj, prop) => {
  if (!hasReservedProp(obj, prop)) {
    return obj
  }
  obj = safetlyAddObjectProp(obj, getEscapedObjectProp(prop), obj[prop])
  delete obj[prop]
  return obj
}

export const unEscapeReservedProps = (obj, prop) => {
  let propName = getEscapedObjectProp(prop)
  if (!hasReservedProp(obj, propName)) {
    return obj
  }
  while (true) {
    if (!hasReservedProp(obj, propName)) {
      break
    }
    obj[getUnescapedObjectProp(propName)] = obj[propName]
    delete obj[propName]
    propName = getEscapedObjectProp(propName)
  }
  return obj
}

const getEscapedObjectProp = prop => `\\${prop}`
const getUnescapedObjectProp = prop =>
  prop.indexOf('\\') === 0 ? prop.substr(1) : prop // A bit weird because of escape chars

export const hasReservedProp = (obj, propName) =>
  Object.prototype.hasOwnProperty.call(obj, propName)

// Epic helpers
export const put = dispatch => action => dispatch(action)

export const optionalToString = v =>
  ![null, undefined].includes(v) && typeof v.toString === 'function'
    ? v.toString()
    : v

export const toKeyString = str => btoa(encodeURIComponent(str))
