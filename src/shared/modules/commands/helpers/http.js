/*
 * Copyright (c) 2002-2017 "Neo Technology,"
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

export const parseHttpVerbCommand = (input) => {
  const p = new Promise((resolve, reject) => {
    const re = /^[^\w]*(get|post|put|delete|head)\s+(\S+)?\s*([\S\s]+)?$/i
    const result = re.exec(input)
    let method, url, data
    try {
      [method, url, data] = [result[1], (result[2] || null), (result[3] || null)]
    } catch (e) {
      reject('Unparseable http request')
      return
    }
    if (!url) {
      reject('Missing path')
      return
    }
    method = method.toLowerCase()
    if (['post', 'put'].indexOf(method) > -1 && data) {
      // Assume JSON
      try {
        JSON.parse(data.replace(/\n/g, ''))
      } catch (e) {
        reject('Payload does not seem to be valid (JSON) data')
        return
      }
    }
    resolve({ method, url, data })
  })
  return p
}
