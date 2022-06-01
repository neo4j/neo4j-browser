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
import { parseURLWithDefaultProtocol } from 'services/utils'

const removeJavascriptFromHref = (string: any) => {
  const localString = string.replace(/href=".*javascript:[^"]*"/, 'href=""')
  return localString.replace(/href='.*javascript:[^']*'/, "href=''")
}
const removeScriptTags = (string: any) =>
  string.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*(<\/script>)?/gi, '')
const removeOnHandlersFromHtml = (string: any) =>
  string.replace(
    /(\s+(on[^\s=]+)[^\s=]*\s*=\s*("[^"]*"|'[^']*'|[\w\-.:]+\s*))/gi,
    ''
  )

export function cleanHtml(string: string): string {
  if (typeof string !== 'string') return string
  const stringWithoutHandlers = removeOnHandlersFromHtml(string)
  const stringWithoutScript = removeScriptTags(stringWithoutHandlers)
  return removeJavascriptFromHref(stringWithoutScript)
}

export const authHeaderFromCredentials = (username: any, password: any) => {
  if (!btoa) throw new Error('btoa not defined') // Non browser env
  return btoa(`${username}:${password}`)
}

export const isLocalRequest = (
  localUrl?: string | null,
  requestUrl?: string | null,
  opts = { hostnameOnly: false }
): boolean => {
  if (!localUrl || !requestUrl) return false

  const localUrlInfo = parseURLWithDefaultProtocol(localUrl)
  if (!localUrlInfo) return false

  if (requestUrl.startsWith('/')) return true

  const requestUrlInfo = parseURLWithDefaultProtocol(requestUrl)
  if (!requestUrlInfo) return false

  if (!requestUrlInfo.host) return true // GET /path

  if (opts.hostnameOnly === true) {
    return requestUrlInfo.hostname === localUrlInfo.hostname
  } // GET localhost:8080 from localhost:9000

  if (
    requestUrlInfo.host === localUrlInfo.host &&
    requestUrlInfo.protocol === localUrlInfo.protocol
  ) {
    // Same host and protocol
    return true
  }
  return false
}
