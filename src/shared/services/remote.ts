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

import 'isomorphic-fetch'

function request(method: any, url: any, data = null, extraHeaders = {}) {
  const headers = {
    'Content-Type': 'application/json',
    'X-Ajax-Browser-Auth': 'true',
    'X-stream': 'true',
    ...extraHeaders
  }
  return fetch(url, {
    method,
    headers,
    body: data
  }).then(checkStatus)
}

function get(url: string, headers: HeadersInit = {}): Promise<string> {
  return fetch(url, {
    method: 'get',
    headers
  })
    .then(checkStatus)
    .then(response => response.text())
}

export function getJSON(url: any) {
  return fetch(url, {
    method: 'get',
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(response => {
      return response.json()
    })
    .catch(e => {
      throw new Error(e)
    })
}

function checkStatus(response: Response) {
  if (response.status >= 200 && response.status < 300) {
    return response
  } else {
    throw {
      ...new Error(`${response.status} ${response.statusText}`),
      response
    }
  }
}

export default {
  get,
  getJSON,
  request
}
