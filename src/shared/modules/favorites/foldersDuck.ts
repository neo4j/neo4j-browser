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
import { Favorite } from './favoritesDuck'
import { folders } from './staticScripts'
import { getBrowserName } from 'services/utils'
import { APP_START, USER_CLEAR } from 'shared/modules/app/appDuck'

export const NAME = 'folders'
export const LOAD_FOLDERS = 'folders/LOAD_FOLDERS'
export const SYNC_FOLDERS = 'folders/SYNC_FOLDERS'
export const ADD_FOLDER = 'folders/ADD_FOLDER'
export const REMOVE_FOLDER = 'folders/REMOVE_FOLDER'
export const UPDATE_FOLDERS = 'folders/UPDATE_FOLDERS'

export const getFolders = (state: any): Folder[] => state[NAME]

export type Folder = {
  id: string //generated id or basics|graphs|profile|procudures
  name: string
  isStatic?: boolean
  versionRange?: string
}

const versionSize = 20
export const initialState: Folder[] = folders

const mergeFolders = (list1: Folder[], list2: Folder[]) => {
  return list1.concat(
    list2.filter(
      (favInList2: any) =>
        list1.findIndex((favInList1: any) => favInList1.id === favInList2.id) <
        0
    )
  )
}

export const addFolder = (id: string, name: string) => {
  return { type: ADD_FOLDER, id, name }
}
export const updateFolders = (folders: Folder[]) => {
  return { type: UPDATE_FOLDERS, folders }
}
export const removeFolder = (id: string) => {
  return { type: REMOVE_FOLDER, id }
}

export const loadFolders = (folders: Folder[]) => {
  return { type: LOAD_FOLDERS, folders }
}

export const syncFolders = (folders: Folder[]) => {
  return { type: SYNC_FOLDERS, folders }
}

export default function reducer(
  state: Folder[] = initialState,
  action: any
): Folder[] {
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
export function cleanFoldersFromStorage(
  stored: undefined | Folder[],
  existingFavs: Favorite[]
): Folder[] {
  if (!stored || !Array.isArray(stored)) {
    return initialState
  }

  const onlyUserDefinedFolders = stored.filter(folder => !folder.isStatic)

  const countFoldersWithName = (name: string) =>
    onlyUserDefinedFolders.filter(folder => folder.name === name).length
  const countFavsInFolder = (folder: Folder) =>
    existingFavs.filter(fav => fav.folder === folder.id).length

  // There was a bug in the past that caused users localstorages to fill up with
  // tons of empty duplicated folders. The workaround was previously in the UI
  // https://github.com/neo4j/neo4j-browser/pull/1308
  // A side effect of this solution is that if you create two empty folders
  // with the same name, they get removed (as long as both are empty)
  // It'd make sense to keep one of them, but because users
  // localstorages are polluted with tons of old, "deleted" folders
  // if we started doing it "properly" now, they'd get a lot of unexpected folders
  // they thought they deleted long ago
  const realFolders = onlyUserDefinedFolders.filter(folder => {
    const folderIsEmpty = countFavsInFolder(folder) === 0
    const folderIsDuplicated = countFoldersWithName(folder.name) > 1
    const isNewFolder = folder.name === 'New Folder'
    const shouldBeRemoved = folderIsDuplicated && folderIsEmpty && !isNewFolder
    return !shouldBeRemoved
  })
  return initialState.concat(realFolders)
  /*
  // remove built-in stored to redux
  // more senseible solution -> would be suprising to users.
  const onlyUserDefinedFolders = stored.filter(folder => !folder.isStatic)

  // an old bug caused us to have tons of duplicated empty folders,
  // Previously just hidden in the ui https://github.com/neo4j/neo4j-browser/pull/1308
  const countFavsInFolder = (folder: Folder) =>
    existingFavs.filter(fav => fav.folder === folder.id).length

  const foldersWithFavs = onlyUserDefinedFolders.filter(
    folder => countFavsInFolder(folder) > 0
  )

  const emptyFolders = onlyUserDefinedFolders.filter(
    folder => countFavsInFolder(folder) === 0
  )

  const folderIsInList = (folder: Folder, list: Folder[]) =>
    list.find(({ name }) => folder.name === name)

  // Keep only the first empty folder, rather than all duplicates
  const deduplicatedEmptyFolders = emptyFolders.reduce(
    (acc: Folder[], current: Folder) => {
      if (
        !folderIsInList(current, acc) &&
        !folderIsInList(current, foldersWithFavs)
      ) {
        return [...acc, current]
      } else {
        return acc
      }
    },
    []
  )

  return initialState.concat(foldersWithFavs).concat(deduplicatedEmptyFolders)
  */
}

export const composeFoldersToSync = (store: any, syncValue: any) => {
  const folders = syncValue.syncObj.folders || []
  const stateFolders = getFolders(store.getState()).filter(
    (fold: any) => !fold.isStatic
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

export const foldersToLoad = (action: any, store: any) => {
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
        (exFold: any) =>
          exFold.isStatic ||
          foldersFromSync.findIndex(
            (syncFold: any) => syncFold.id === exFold.id
          ) >= 0
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
