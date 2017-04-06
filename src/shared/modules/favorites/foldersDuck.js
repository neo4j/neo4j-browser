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

import { SET_SYNC } from 'shared/modules/sync/syncDuck'
import { APP_START, USER_CLEAR } from 'shared/modules/app/appDuck'

export const NAME = 'folders'
export const LOAD_FOLDERS = 'folders/LOAD_FOLDERS'

export const getFolders = (state) => state[NAME]

import {folders} from './staticScripts'

const initialState = folders

const mergeFolders = (list1, list2) => {
  return list1.concat(list2.filter(favInList2 => list1.findIndex(favInList1 => favInList1.id === favInList2.id) < 0))
}

export default function reducer (state = initialState, action) {
  switch (action.type) {
    case LOAD_FOLDERS :
      return mergeFolders(initialState, action.folders)
    case APP_START:
      return mergeFolders(initialState, state)
    case USER_CLEAR:
      return initialState
    default:
      return state
  }
}

const foldersToLoad = (action, store) => {
  const syncFolders = (action.obj.syncObj && action.obj.syncObj.folders && action.obj.syncObj.folders.length > 0)
    ? action.obj.syncObj.folders[0].data
    : null

  if (syncFolders) {
    const existingFolders = getFolders(store.getState())
    return mergeFolders(syncFolders, existingFolders)
  } else {
    return null
  }
}

export const loadFoldersFromSyncEpic = (action$, store) =>
  action$.ofType(SET_SYNC)
    .do((action) => {
      const folders = foldersToLoad(action, store)
      if (folders && folders.length > 0) {
        store.dispatch({type: LOAD_FOLDERS, folders})
      }
    })
    .mapTo({ type: 'NOOP' })
