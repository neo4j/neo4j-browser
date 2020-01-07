/*
 * Copyright (c) 2002-2020 "Neo4j,"
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
import MyScripts from '@relate-by-ui/saved-scripts'

import * as editor from 'shared/modules/editor/editorDuck'
import { executeCommand } from 'shared/modules/commands/commandsDuck'
import * as favorites from '../../../shared/modules/favorites/favoritesDuck'
import * as folders from '../../../shared/modules/favorites/foldersDuck'

import {
  mapOldFavoritesAndFolders,
  SLASH
} from '../../../shared/services/export-favorites'

const mapFavoritesStateToProps = state => {
  const scripts = mapOldFavoritesAndFolders(
    favorites.getFavorites(state),
    folders.getFolders(state),
    ({ isStatic }) => isStatic
  )

  return {
    title: 'Sample Scripts',
    scriptsNamespace: SLASH,
    scripts: scripts,
    isStatic: true
  }
}
const mapFavoritesDispatchToProps = (dispatch, ownProps) => ({
  onSelectScript: favorite =>
    ownProps.bus.send(
      editor.EDIT_CONTENT,
      editor.editContent(favorite.id, favorite.contents)
    ),
  onExecScript: favorite => dispatch(executeCommand(favorite.contents)),
  onExportScripts: Function.prototype,
  onRemoveScript: Function.prototype,
  onUpdateFolder: Function.prototype,
  onRemoveFolder: Function.prototype
})
const Favorites = withBus(
  connect(mapFavoritesStateToProps, mapFavoritesDispatchToProps)(MyScripts)
)

export default Favorites
