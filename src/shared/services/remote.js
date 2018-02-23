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

/* global fetch */
import 'isomorphic-fetch'

function request (method, url, data = null, extraHeaders = {}) {
  const headers = {
    'Content-Type': 'application/json',
    'X-Ajax-Browser-Auth': 'true',
    'X-stream': 'true',
    ...extraHeaders
  }
  return fetch(url, {
    method,
    headers: headers,
    body: data
  }).then(checkStatus)
}

function get (url) {
  return fetch(url, {
    method: 'get'
  })
    .then(checkStatus)
    .then(function (response) {
      return response.text()
    })
}

export function getJSON (url) {
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

function checkStatus (response) {
  if (response.status >= 200 && response.status < 300) {
    return response
  } else {
    var error = new Error(response.status + ' ' + response.statusText)
    error.response = response
    throw error
  }
}

export default {
  get,
  getJSON,
  request
}
