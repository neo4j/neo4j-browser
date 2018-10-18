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

import { version } from 'project-root/package.json'

let counter = 0

// Application info
const NEO4J_BROWSER_BACKGROUND_QUERY = `NEO4J_BROWSER_BACKGROUND_QUERY`
const NEO4J_BROWSER_USER_QUERY = `NEO4J_BROWSER_USER_QUERY`
const NEO4J_BROWSER_APP_ID = `NEO4J_BROWSER_V${version}`

export const getBackgroundTxMetadata = ({ hasServerSupport = false }) => {
  if (!hasServerSupport) {
    return {}
  }
  return {
    txMetadata: {
      type: NEO4J_BROWSER_BACKGROUND_QUERY,
      application: NEO4J_BROWSER_APP_ID,
      query_number: ++counter
    }
  }
}

export const getUserTxMetadata = ({ hasServerSupport = false }) => {
  if (!hasServerSupport) {
    return {}
  }
  return {
    txMetadata: {
      type: NEO4J_BROWSER_USER_QUERY,
      application: NEO4J_BROWSER_APP_ID,
      query_number: ++counter
    }
  }
}
