/*
 * Copyright (c) 2002-2019 "Neo4j,"
 * Neo4j Sweden AB [http://neo4j.com]
 * This file is part of Neo4j.
 * Neo4j is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

import { BROWSER_FAVORITES_BASE_URL } from '../user-favorites.constants'

const DEFAULT_OPTIONS = {
  headers: { 'content-type': 'application/json' }
}
let client

/**
 * Constructs an HTTP REST client
 * @return    {Object}      http REST client
 */
export default function getRestClient () {
  if (client) {
    return client
  }

  const throwOrJSON = response => {
    if (!response.ok) {
      throw new Error(`${response.status}: ${response.statusText}`)
    }

    return response.json()
  }
  const clientFetch = (route, options = {}) =>
    fetch(`${BROWSER_FAVORITES_BASE_URL}${route}`, {
      ...DEFAULT_OPTIONS,
      ...options
    }).then(throwOrJSON)

  client = {
    GET (path = '') {
      return clientFetch(path)
    },
    POST (path = '', payload) {
      return clientFetch(path, {
        method: 'POST',
        body: JSON.stringify(payload)
      })
    },
    PUT (path = '', payload) {
      return clientFetch(path, {
        method: 'PUT',
        body: JSON.stringify(payload)
      })
    },
    DELETE (path = '') {
      return clientFetch(path, {
        method: 'DELETE'
      })
    }
  }

  return client
}
