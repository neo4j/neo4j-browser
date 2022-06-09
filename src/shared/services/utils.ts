/*
 * Copyright (c) "Neo4j"
 * Neo4j Sweden AB [http://neo4j.com]
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
import { isNumber, trimEnd, trimStart } from 'lodash-es'
import { URL } from 'whatwg-url' // Firefox & Chrome builtin URL doesn't handle bolt:// protocol properly https://bugs.chromium.org/p/chromium/issues/detail?id=869291

import { CLOUD, DESKTOP, WEB } from 'shared/modules/app/appDuck'

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

export const serialExecution = (...args: any[]) => {
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

export const AUTH_STORAGE_PREFIX = '/browser-auth#'
export const AUTH_STORAGE_CONNECT_HOST = `${AUTH_STORAGE_PREFIX}connect_host`

const linkPromises = (next: any) => {
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
      .catch((e: any) => {
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
            .then((r: any) => {
              next.onSuccess && next.onSuccess(r)
              resolve(r)
            })
            .catch((e: any) => {
              next.onError && next.onError(e)
              reject(e)
            })
        })
      })
  )
}

export const shallowEquals = (a: any, b: any) => {
  for (const key in a) if (a[key] !== b[key]) return false
  for (const key in b) if (!(key in a)) return false
  return true
}

export const flatten = (arr: any) =>
  arr.reduce(
    (a: any, b: any) => a.concat(Array.isArray(b) ? flatten(b) : b),
    []
  )

export const moveInArray = (fromIndex: any, toIndex: any, arr: any) => {
  if (!Array.isArray(arr)) return []
  if (fromIndex < 0 || fromIndex >= arr.length) return arr
  if (toIndex < 0 || toIndex >= arr.length) return arr
  const newArr = ([] as any[]).concat(arr)
  const el = arr[fromIndex]
  newArr.splice(fromIndex, 1)
  newArr.splice(toIndex, 0, el)
  return newArr
}

export const throttle = (fn: any, time: any, context = null) => {
  let blocking: any
  return (...args: any[]) => {
    if (blocking) return
    blocking = true
    typeof fn === 'function' && fn.apply(context, args)
    setTimeout(() => (blocking = false), parseInt(time))
  }
}

export const firstSuccessPromise = (list: any, fn: any) => {
  return list.reduce((promise: any, item: any) => {
    return promise.catch(() => fn(item)).then((r: any) => Promise.resolve(r))
  }, Promise.reject(new Error()))
}

export const hostIsAllowed = (url: string, allowlistStr?: string): boolean => {
  if (allowlistStr === '*') return true
  const urlInfo = parseURLWithDefaultProtocol(url)
  if (!urlInfo) return false

  const hostname = urlInfo.hostname
  const hostnamePlusProtocol = `${urlInfo.protocol}//${hostname}`
  const allowlistHostsList = allowlistStr
    ? extractAllowlistFromConfigString(allowlistStr)
    : []
  return (
    allowlistHostsList.indexOf(hostname) > -1 ||
    allowlistHostsList.indexOf(hostnamePlusProtocol) > -1
  )
}

export const extractAllowlistFromConfigString = (str: string): string[] =>
  str.split(',').map((s: string) => s.trim().replace(/\/$/, ''))

export const addProtocolsToUrlList = (urlList: (string | null)[]): string[] =>
  urlList.reduce((all: string[], uri: string | null) => {
    if (!uri || uri === '*') return all

    if (isValidURL(uri)) {
      return all.concat(uri)
    } else {
      const withProtocols = [`https://${uri}`, `http://${uri}`]
      return all.concat(withProtocols.filter(isValidURL))
    }
  }, [])

export const resolveAllowlistWildcard = (
  allowlist: (string | null)[],
  resolveTo: string[] = []
): (string | null)[] => {
  return allowlist.reduce((all: (string | null)[], entry: string | null) => {
    return all.concat(entry && entry.trim() === '*' ? resolveTo : entry)
  }, [])
}

function isValidURL(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}
export const parseURLWithDefaultProtocol = (url: string): null | URL => {
  const matcher = url.match(/^(.+:\/\/)?/)
  const protocolMissing = matcher === null || matcher[1] === undefined
  // prepend a default protocol, if none was found
  const urlWithProtocol = protocolMissing ? `http://${url}` : url

  try {
    return new URL(urlWithProtocol)
  } catch {
    return null
  }
}

export const getUrlParamValue = (name: any, url: any) => {
  if (!url) return false
  const out = []
  const re = new RegExp(`[\\?&]${name}=([^&#]*)`, 'g')
  let results
  while ((results = re.exec(url)) !== null) {
    if (results && results[1]) out.push(results[1])
  }
  if (!out.length) return undefined
  return out
}

export const toHumanReadableBytes = (input: any) => {
  let number = +input
  if (!isFinite(number)) {
    return '-'
  }

  if (number < 1024) {
    return `${number} B`
  }

  number /= 1024
  const units = ['KiB', 'MiB', 'GiB', 'TiB']

  for (const unit of Array.from(units)) {
    if (number < 1024) {
      return `${number.toFixed(2)} ${unit}`
    }
    number /= 1024
  }

  return `${number.toFixed(2)} PiB`
}

export const getBrowserName = function () {
  if (!!(window as any).opera || navigator.userAgent.indexOf(' OPR/') >= 0) {
    return 'Opera'
  }
  // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'InstallTrigger'.
  if (typeof InstallTrigger !== 'undefined') {
    return 'Firefox'
  }
  if (navigator.userAgent.match(/Version\/[\d.]+.*Safari/)) {
    return 'Safari'
  }
  if ((window as any).chrome) {
    return 'Chrome'
  }
  if ((document as any).documentMode) {
    return 'Internet Explorer'
  }
  //@ts-ignore
  if (window.StyleMedia) {
    return 'Edge'
  }
  return 'Unknown'
}

export const canUseDOM = (): boolean =>
  !!(
    typeof window !== 'undefined' &&
    window.document &&
    window.document.createElement
  )

export const escapeCypherIdentifier = (str: any) =>
  /^[A-Za-z][A-Za-z0-9_]*$/.test(str) ? str : `\`${str.replace(/`/g, '``')}\``

export const unescapeCypherIdentifier = (str: any) =>
  [str]
    .map(s => trimStart(s, '`'))
    .map(s => trimEnd(s, '`'))
    .map(s => s.replace(/``/g, '`'))[0]

export const parseTimeMillis = (timeWithOrWithoutUnit: any) => {
  const time = String(timeWithOrWithoutUnit) // cast to string
  const readUnit = time.match(/\D+/)
  const value = parseInt(time)

  const unit = readUnit === null ? 's' : readUnit[0] // Assume seconds

  switch (unit) {
    case 'ns':
      return Math.round(value / (1000 * 1000))
    case 'μs':
      return Math.round(value / 1000)
    case 'ms':
      return value
    case 's':
      return value * 1000
    case 'm':
      return value * 60 * 1000
    case 'h':
      return value * 60 * 60 * 1000
    case 'd':
      return value * 24 * 60 * 60 * 1000
    default:
      return 0
  }
}

export const arrayToObject = (array: any) =>
  array.reduce((obj: any, item: any) => {
    const key = Object.keys(item)[0]
    const value = Object.values(item)[0]
    obj[key] = value
    return obj
  }, {})

export const stringifyMod = (
  value: any,
  modFn: any = null,
  pretty: boolean | number = false,
  skipOpeningIndentation = false
): string => {
  const prettyLevel = isNumber(pretty) ? pretty : +pretty
  const nextPrettyLevel = prettyLevel ? prettyLevel + 1 : false
  const newLine = prettyLevel ? '\n' : ''
  const indentation =
    prettyLevel && !skipOpeningIndentation ? Array(prettyLevel).join('  ') : ''
  const nextIndentation =
    nextPrettyLevel && !skipOpeningIndentation
      ? Array(nextPrettyLevel).join('  ')
      : ''
  const endIndentation = prettyLevel ? Array(prettyLevel).join('  ') : ''
  const propSpacing = prettyLevel ? ' ' : ''
  const toString = Object.prototype.toString
  const isArray =
    Array.isArray ||
    function (a) {
      return toString.call(a) === '[object Array]'
    }
  const escMap: any = {
    '"': '\\"',
    '\\': '\\',
    '\b': '\b',
    '\f': '\f',
    '\n': '\n',
    '\r': '\r',
    '\t': '\t'
  }
  const escFunc = function (m: any) {
    return (
      escMap[m] || `\\u${(m.charCodeAt(0) + 0x10000).toString(16).substr(1)}`
    )
  }
  const escRE = /[\\"\u0000-\u001F\u2028\u2029]/g
  if (modFn) {
    const modVal = modFn && modFn(value)
    if (typeof modVal !== 'undefined') return indentation + modVal
  }
  if (value == null) return `${indentation}null`
  if (typeof value === 'number') {
    return indentation + (isFinite(value) ? value.toString() : 'null')
  }
  if (typeof value === 'boolean') return `${indentation}${value.toString()}`
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
      return `${indentation}[${res}${
        hasValues ? newLine + endIndentation : ''
      }]`
    } else if (toString.call(value) === '[object Object]') {
      const tmp = []
      for (const k in value) {
        if (value.hasOwnProperty(k)) {
          tmp.push(
            `${nextIndentation}${JSON.stringify(
              k
            )}:${propSpacing}${stringifyMod(
              value[k],
              modFn,
              nextPrettyLevel,
              true
            )}`
          )
        }
      }
      return `${indentation}{${newLine}${tmp.join(
        `,${newLine}`
      )}${newLine}${endIndentation}}`
    }
  }
  return `${indentation}"${value.toString().replace(escRE, escFunc)}"`
}

export const unescapeDoubleQuotesForDisplay = (str: any) =>
  str.replace(/\\"/g, '"')

export const safelyAddObjectProp = (obj: any, prop: any, val: any): any => {
  const localObj = escapeReservedProps(obj, prop)
  localObj[prop] = val
  return localObj
}

export const safelyRemoveObjectProp = (obj: any, prop: any) => {
  if (!hasReservedProp(obj, prop)) {
    return obj
  }
  delete obj[prop]
  return unEscapeReservedProps(obj, prop)
}

export const escapeReservedProps = (obj: any, prop: any) => {
  if (!hasReservedProp(obj, prop)) {
    return obj
  }
  const localObj = safelyAddObjectProp(
    obj,
    getEscapedObjectProp(prop),
    obj[prop]
  )
  delete localObj[prop]
  return localObj
}

export const unEscapeReservedProps = (obj: any, prop: any) => {
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

const getEscapedObjectProp = (prop: any) => `\\${prop}`
const getUnescapedObjectProp = (prop: any) =>
  prop.indexOf('\\') === 0 ? prop.substr(1) : prop // A bit weird because of escape chars

const hasReservedProp = (obj: any, propName: any) =>
  Object.prototype.hasOwnProperty.call(obj, propName)

export const optionalToString = (v: any) =>
  ![null, undefined].includes(v) && typeof v.toString === 'function'
    ? v.toString()
    : v

export function flushPromises() {
  return new Promise(resolve => setImmediate(resolve))
}

export async function sleep(ms: any) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function isCloudHost(host: string, cloudDomains: string[]): boolean {
  try {
    const { hostname } = new URL(host)
    return cloudDomains.some(cloudDomain => hostname.endsWith(cloudDomain))
  } catch {
    return false
  }
}

export function detectRuntimeEnv(win?: any, cloudDomains: string[] = []) {
  if (win && win.neo4jDesktopApi) {
    return DESKTOP
  }

  try {
    const { searchParams } = new URL(win?.location?.href || '')

    if (
      searchParams.get('neo4jDesktopApiUrl') &&
      searchParams.get('neo4jDesktopGraphAppClientId')
    ) {
      return DESKTOP
    }
  } catch {}

  if (isCloudHost(win?.location?.href ?? '', cloudDomains)) {
    return CLOUD
  }

  return WEB
}

export const isRunningE2ETest = (): boolean => !!window.Cypress
