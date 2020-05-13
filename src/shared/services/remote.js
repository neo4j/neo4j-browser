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

import 'isomorphic-fetch'

function request(method, url, data = null, extraHeaders = {}) {
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

function get(url, headers = {}) {
  return fetch(url, {
    method: 'get',
    headers
  })
    .then(checkStatus)
    .then(response => response.text())
}

export function getJSON(url) {
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

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response
  } else {
    const error = new Error(`${response.status} ${response.statusText}`)
    error.response = response
    throw error
  }
}

export default {
  get,
  getJSON,
  request
}
