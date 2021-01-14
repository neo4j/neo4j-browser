/*
 * Copyright (c) "Neo4j"
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

import { withBus } from 'react-suber'
import { connect } from 'react-redux'
import MyScripts from 'browser/components/SavedScripts'

import * as editor from 'shared/modules/editor/editorDuck'
import {
  commandSources,
  executeCommand
} from 'shared/modules/commands/commandsDuck'
import * as favoritesDuck from 'shared/modules/favorites/favoritesDuck'
import * as foldersDuck from 'shared/modules/favorites/foldersDuck'
import {
  exportFavorites,
  SLASH,
  mapOldFavoritesAndFolders
} from 'shared/services/export-favorites'
import {
  generateFolderNameAndIdForPath,
  mapNewFavoritesToOld,
  folderHasRemainingFavorites,
  getFirstFavorite,
  getFavoriteIds,
  getFolderFromPath,
  updateFolder
} from './favorites.utils'

const mapFavoritesStateToProps = (state: any) => {
  const folders = foldersDuck.getFolders(state)
  const scripts = mapOldFavoritesAndFolders(
    favoritesDuck.getFavorites(state),
    folders
  )

  return {
    scriptsNamespace: SLASH,
    scripts,
    folders,
    title: 'Local Scripts'
  }
}
const mapFavoritesDispatchToProps = (dispatch: any, ownProps: any) => ({
  selectScript: (favorite: any) =>
    ownProps.bus.send(
      editor.EDIT_CONTENT,
      editor.editContent(favorite.id, favorite.contents)
    ),
  execScript: (favorite: any) =>
    dispatch(
      executeCommand(favorite.contents, { source: commandSources.favorite })
    ),
  exportScripts: (scripts: any) => exportFavorites(scripts),
  removeScript: (favorite: any) =>
    dispatch(favoritesDuck.removeFavorite(favorite.id)),
  updateFolder(favorites: any, payload: any, allFolders: any) {
    // favorite name update
    if (payload.name) {
      dispatch(
        favoritesDuck.updateFavorites(
          mapNewFavoritesToOld(favorites, { name: payload.name })
        )
      )

      return
    }

    // future proofing
    if (!payload.path) return

    const { folder: sourceFolder } = (getFirstFavorite(favorites) as any) || {}
    const { id: folderId, name: folderName } = generateFolderNameAndIdForPath(
      payload.path
    )

    if (sourceFolder && payload.isFolderName) {
      dispatch(
        foldersDuck.updateFolders(
          updateFolder(sourceFolder, { name: folderName }, allFolders)
        )
      )

      return
    }

    if (!sourceFolder || payload.isNewFolder) {
      dispatch(foldersDuck.addFolder(folderId, folderName))
    }

    const targetFolder = getFolderFromPath(payload.path, allFolders)
    const targetId = targetFolder ? targetFolder.id : folderId

    dispatch(
      favoritesDuck.updateFavorites(
        mapNewFavoritesToOld(favorites, {
          folder: targetId
        })
      )
    )
  },
  removeFolder(favorites: any) {
    const { folder } = (getFirstFavorite(favorites) as any) || {}

    if (!folder) return

    dispatch(foldersDuck.removeFolder(folder.id))
    dispatch(favoritesDuck.removeFavorites(getFavoriteIds(favorites)))
  }
})

const mergeProps = (stateProps: any, dispatchProps: any) => {
  return {
    ...stateProps,
    ...dispatchProps,
    exportScripts: () => dispatchProps.exportScripts(stateProps.scripts),
    updateFolder: (favorites: any, payload: any) =>
      dispatchProps.updateFolder(favorites, payload, stateProps.folders)
  }
}

export default withBus(
  connect(
    mapFavoritesStateToProps,
    mapFavoritesDispatchToProps,
    mergeProps
  )(MyScripts)
)
