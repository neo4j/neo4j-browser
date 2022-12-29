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
import { connect } from 'react-redux'
import { withBus } from 'react-suber'
import semver from 'semver'

import * as favorites from '../../../shared/modules/favorites/favoritesDuck'
import { getFolders } from '../../../shared/modules/favorites/foldersDuck'
import MyScripts from 'browser/components/SavedScripts'
import {
  commandSources,
  executeCommand
} from 'shared/modules/commands/commandsDuck'
import { getRawVersion } from 'shared/modules/dbMeta/dbMetaDuck'
import * as editor from 'shared/modules/editor/editorDuck'

const mapFavoritesStateToProps = (state: any) => {
  const version = semver.coerce(getRawVersion(state) || '0') ?? '0'
  const folders = getFolders(state).filter(folder => folder.isStatic)
  const scripts = favorites
    .getFavorites(state)
    .filter(
      fav =>
        fav.isStatic &&
        fav.versionRange &&
        semver.satisfies(version, fav.versionRange)
    )

  return {
    title: 'Sample Scripts',
    folders,
    scripts
  }
}
const mapFavoritesDispatchToProps = (dispatch: any, ownProps: any) => ({
  selectScript: (favorite: favorites.Favorite) =>
    ownProps.bus.send(
      editor.EDIT_CONTENT,
      editor.editContent(favorite.id, favorite.content, { isStatic: true })
    ),
  execScript: (favorite: any) =>
    dispatch(executeCommand(favorite.content), {
      source: commandSources.sidebar
    })
})

const Favorites = withBus(
  connect(mapFavoritesStateToProps, mapFavoritesDispatchToProps)(MyScripts)
)

export default Favorites
