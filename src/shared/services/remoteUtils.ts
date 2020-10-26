/*
 * Copyright (c) 2002-2020 "Neo4j,"
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
import { getUrlInfo } from 'services/utils'

const removeJavascriptFromHref = string => {
  const localString = string.replace(/href=".*javascript:[^"]*"/, 'href=""')
  return localString.replace(/href='.*javascript:[^']*'/, "href=''")
}
const removeScriptTags = string =>
  string.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*(<\/script>)?/gi, '')
const removeOnHandlersFromHtml = string =>
  string.replace(
    /(\s+(on[^\s=]+)[^\s=]*\s*=\s*("[^"]*"|'[^']*'|[\w\-.:]+\s*))/gi,
    ''
  )

export function cleanHtml(string) {
  if (typeof string !== 'string') return string
  const stringWithoutHandlers = removeOnHandlersFromHtml(string)
  const stringWithoutScript = removeScriptTags(stringWithoutHandlers)
  return removeJavascriptFromHref(stringWithoutScript)
}

export const authHeaderFromCredentials = (username, password) => {
  if (!btoa) throw new Error('btoa not defined') // Non browser env
  return btoa(`${username}:${password}`)
}

export const isLocalRequest = (
  localUrl,
  requestUrl,
  opts = { hostnameOnly: false }
) => {
  if (!localUrl) return false

  const localUrlInfo = getUrlInfo(localUrl)
  const requestUrlInfo = getUrlInfo(requestUrl)
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
