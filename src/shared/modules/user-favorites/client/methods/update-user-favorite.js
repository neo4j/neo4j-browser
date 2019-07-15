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

import { find, without } from 'lodash-es'

import { USE_REST_API } from '../../user-favorites.constants'
import {
  setUserFavoritesLocalState,
  tryGetUserFavoritesLocalState
} from '../../user-favorites.utils'
import getRestClient from '../get-rest-client'

export default async function updateUserFavorite (scriptId, data) {
  if (USE_REST_API) {
    const restClient = getRestClient()

    return restClient.PUT(`/${scriptId}`, data)
  }

  const alreadySaved = tryGetUserFavoritesLocalState()
  const toUpdate = find(alreadySaved, ({ id }) => id === scriptId)
  const others = without(alreadySaved, toUpdate)
  const updated = { ...toUpdate, ...data }

  setUserFavoritesLocalState([...others, updated])

  return updated
}
