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

import { APP_START, USER_CLEAR } from 'shared/modules/app/appDuck'
import { getBrowserName } from 'services/utils'
import { folders } from './staticScripts'

export const NAME = 'folders'
export const LOAD_FOLDERS = 'folders/LOAD_FOLDERS'
export const SYNC_FOLDERS = 'folders/SYNC_FOLDERS'
export const ADD_FOLDER = 'folders/ADD_FOLDER'
export const REMOVE_FOLDER = 'folders/REMOVE_FOLDER'
export const UPDATE_FOLDERS = 'folders/UPDATE_FOLDERS'

export const getFolders = state => state[NAME]

const versionSize = 20
const initialState = folders

const mergeFolders = (list1, list2) => {
  return list1.concat(
    list2.filter(
      favInList2 =>
        list1.findIndex(favInList1 => favInList1.id === favInList2.id) < 0
    )
  )
}

export const addFolder = (id, name) => {
  return { type: ADD_FOLDER, id, name }
}
export const updateFolders = folders => {
  return { type: UPDATE_FOLDERS, folders }
}
export const removeFolder = id => {
  return { type: REMOVE_FOLDER, id }
}

export const loadFolders = folders => {
  return { type: LOAD_FOLDERS, folders }
}

export const syncFolders = folders => {
  return { type: SYNC_FOLDERS, folders }
}

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case LOAD_FOLDERS:
    case UPDATE_FOLDERS:
      return mergeFolders(initialState, action.folders)
    case APP_START:
      return mergeFolders(initialState, state)
    case REMOVE_FOLDER:
      return state.filter(folder => folder.id !== action.id)
    case ADD_FOLDER:
      return state.concat([{ id: action.id, name: action.name }])
    case USER_CLEAR:
      return initialState
    default:
      return state
  }
}

export const composeFoldersToSync = (store, syncValue) => {
  const folders = syncValue.syncObj.folders || []
  const stateFolders = getFolders(store.getState()).filter(
    fold => !fold.isStatic
  )

  const newFolders = [
    {
      client: getBrowserName(),
      data: stateFolders,
      syncedAt: Date.now()
    }
  ].concat(folders.slice(0, versionSize))

  return newFolders
}

export const foldersToLoad = (action, store) => {
  const foldersFromSync =
    action.obj.syncObj &&
    action.obj.syncObj.folders &&
    action.obj.syncObj.folders.length > 0
      ? action.obj.syncObj.folders[0].data
      : null

  if (foldersFromSync) {
    const existingFolders = getFolders(store.getState())
    const allFolders = mergeFolders(foldersFromSync, existingFolders)

    if (
      existingFolders.every(
        exFold =>
          exFold.isStatic ||
          foldersFromSync.findIndex(syncFold => syncFold.id === exFold.id) >= 0
      )
    ) {
      return { folders: allFolders, syncFolders: false, loadFolders: true }
    } else {
      return { folders: allFolders, syncFolders: true, loadFolders: true }
    }
  } else {
    return { folders: null, syncFolders: false, loadFolders: false }
  }
}
