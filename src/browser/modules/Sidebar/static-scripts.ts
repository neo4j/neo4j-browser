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
import semver from 'semver'

import * as editor from 'shared/modules/editor/editorDuck'
import {
  commandSources,
  executeCommand
} from 'shared/modules/commands/commandsDuck'
import * as favorites from '../../../shared/modules/favorites/favoritesDuck'
import * as folders from '../../../shared/modules/favorites/foldersDuck'
import { getVersion } from 'shared/modules/dbMeta/dbMetaDuck'

import {
  mapOldFavoritesAndFolders,
  SLASH
} from '../../../shared/services/export-favorites'

const mapFavoritesStateToProps = (state: any) => {
  const version = semver.coerce(getVersion(state) || '0') ?? '0'
  const scripts = mapOldFavoritesAndFolders(
    favorites.getFavorites(state),
    folders.getFolders(state),
    ({ isStatic, versionRange }) =>
      isStatic && semver.satisfies(version, versionRange)
  )

  return {
    title: 'Sample Scripts',
    scriptsNamespace: SLASH,
    scripts,
    isStatic: true
  }
}
const mapFavoritesDispatchToProps = (dispatch: any, ownProps: any) => ({
  onSelectScript: (favorite: any) =>
    ownProps.bus.send(
      editor.EDIT_CONTENT,
      editor.editContent(favorite.id, favorite.contents, { isStatic: true })
    ),
  onExecScript: (favorite: any) =>
    dispatch(executeCommand(favorite.contents), {
      source: commandSources.sidebar
    }),
  onExportScripts: Function.prototype,
  onRemoveScript: Function.prototype,
  onUpdateFolder: Function.prototype,
  onRemoveFolder: Function.prototype
})
const Favorites = withBus(
  connect(mapFavoritesStateToProps, mapFavoritesDispatchToProps)(MyScripts)
)

export default Favorites
