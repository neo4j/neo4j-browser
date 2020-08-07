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

export const parseHttpVerbCommand = input => {
  const p = new Promise((resolve, reject) => {
    const re = /^[^\w]*(get|post|put|delete|head)\s+(\S+)?\s*([\S\s]+)?$/i
    const result = re.exec(input)
    let method, url, data
    try {
      ;[method, url, data] = [result[1], result[2] || null, result[3] || null]
    } catch (e) {
      reject(new Error('Unparseable http request'))
      return
    }
    if (!url) {
      reject(new Error('Missing path'))
      return
    }
    method = method.toLowerCase()
    if (['post', 'put'].indexOf(method) > -1 && data) {
      // Assume JSON
      try {
        JSON.parse(data.replace(/\n/g, ''))
      } catch (e) {
        reject(new Error('Payload does not seem to be valid (JSON) data'))
        return
      }
    }
    resolve({ method, url, data })
  })
  return p
}

// Check if valid url, from http://stackoverflow.com/questions/5717093/check-if-a-javascript-string-is-a-url
export function isValidURL(str) {
  const pattern = new RegExp(
    '^(https?:\\/\\/)?' + // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|' + // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
      '(\\#[-a-z\\d_]*)?$',
    'i'
  ) // fragment locator
  return pattern.test(str)
}
