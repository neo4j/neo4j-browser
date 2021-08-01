import { isObject } from 'lodash'
import { AUTH_LOGGING_PREFIX, AUTH_STORAGE_LOGS } from './constants'
import { isAuthLoggingEnabled, isAuthDebuggingEnabled } from './settings'
import { saveAs } from 'file-saver'

const MAX_LOG_LINES = 200
export const authLog = (msg, type = 'log') => {
  if (!isAuthLoggingEnabled) return
  if (!['log', 'error', 'warn'].includes(type)) return
  const messageNoNewlines = msg.replace('\n', ' ')
  const log = `${AUTH_LOGGING_PREFIX} [${new Date().toISOString()}] ${messageNoNewlines}`
  const logs = sessionStorage.getItem(AUTH_STORAGE_LOGS) || ''
  const logsLines = logs.split('\n')

  const truncatedOldLogs =
    logsLines.length > MAX_LOG_LINES ? logsLines.slice(-199).join('\n') : logs

  sessionStorage.setItem(AUTH_STORAGE_LOGS, `${truncatedOldLogs}${log}\n`)
}

export const downloadAuthLogs = () => {
  const blob = new Blob([sessionStorage.getItem(AUTH_STORAGE_LOGS)], {
    type: 'text/plain;charset=utf-8'
  })
  saveAs(blob, 'neo4j-browser-sso.log')
}

export const authDebug = (msg, content) => {
  if (!isAuthDebuggingEnabled) return
  console.log(`${AUTH_LOGGING_PREFIX} - DEBUG - ${msg}`)
  console.dir(content)
}

export const createNonce = () =>
  Array.from(window.crypto.getRandomValues(new Uint32Array(4)), t =>
    t.toString(36)
  ).join('-')

export const createStateForRequest = () => {
  const base = Array.from(
    window.crypto.getRandomValues(new Uint32Array(4)),
    t => t.toString(16)
  ).join('-')
  return `state-${base}`
}

export const createCodeVerifier = method => {
  const errorMessage = `${AUTH_LOGGING_PREFIX} code verifier, Invalid argument`

  switch (method) {
    case 'plain':
    case 'S256':
      const randomString = Array.from(
        window.crypto.getRandomValues(new Uint8Array(32)),
        t => String.fromCharCode(t)
      ).join('')
      return _btoaUrlSafe(randomString)
    case '':
    case null:
      return null
    default:
      throw errorMessage
  }
}

export const createCodeChallenge = async (method, codeVerifier) => {
  const errorMessage = `${AUTH_LOGGING_PREFIX} code challenge, Invalid argument`

  switch (method) {
    case 'plain':
      if (codeVerifier === null) throw errorMessage
      return codeVerifier
    case 'S256':
      if (codeVerifier === null) throw errorMessage
      let bytes = Uint8Array.from(codeVerifier, t => t.charCodeAt(0))
      bytes = await window.crypto.subtle.digest('SHA-256', bytes)
      const stringFromBytes = Array.from(new Uint8Array(bytes), t =>
        String.fromCharCode(t)
      ).join('')
      return _btoaUrlSafe(stringFromBytes)
    case '':
    case null:
      return null
    default:
      throw errorMessage
  }
}

export const addSearchParamsInBrowserHistory = paramsToAddObj => {
  if (!paramsToAddObj || !isObject(paramsToAddObj)) return

  const crntHashParams = window.location.hash || undefined
  const searchParams = new URLSearchParams(window.location.search)
  Object.entries(paramsToAddObj).forEach(([key, value]) => {
    if (key && value && value.length) {
      searchParams.set(key, value)
    }
  })

  const newUrl = `${
    window.location.origin
  }?${searchParams.toString()}${crntHashParams || ''}`
  window.history.replaceState({ path: newUrl }, '', newUrl)
}

export const removeSearchParamsInBrowserHistory = paramsToRemove => {
  if (!paramsToRemove || !paramsToRemove.length) return

  const currentUrlSearchParams = new URLSearchParams(window.location.search)
  const cleansedSearchParams = {}
  for (const [key, value] of currentUrlSearchParams.entries()) {
    if (!paramsToRemove.includes(key)) {
      cleansedSearchParams[key] = value
    }
  }
  const newUrlSearchParams = new URLSearchParams(cleansedSearchParams)

  const newUrl = `${window.location.origin}?${newUrlSearchParams.toString()}`
  window.history.replaceState({}, '', newUrl)
}

/*
 * Encode text safely to Base64 url
 * https://tools.ietf.org/html/rfc7515#appendix-C
 * https://tools.ietf.org/html/rfc4648#section-5
 */
const _btoaUrlSafe = text => {
  if (!text) return null

  return window
    .btoa(text)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '') // remove trailing padding characters
}
