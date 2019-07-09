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

import { withBus } from 'react-suber'
import { connect } from 'react-redux'

import * as userFavorites from '../../../shared/modules/user-favorites/user-favorites.duck'
import * as editor from '../../../shared/modules/editor/editorDuck'
import { executeCommand } from '../../../shared/modules/commands/commandsDuck'
import { BROWSER_STATIC_SCRIPTS_NAMESPACE } from '../../../shared/modules/user-favorites/user-favorites.constants'

import MyScripts from '../my-scripts/my-scripts'

const mapFavoritesStateToProps = state => ({
  title: 'Sample Scripts',
  scriptsNamespace: BROWSER_STATIC_SCRIPTS_NAMESPACE,
  scripts: state[userFavorites.NAME].staticScripts,
  isStatic: true
})
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
  connect(
    mapFavoritesStateToProps,
    mapFavoritesDispatchToProps
  )(MyScripts)
)

export default Favorites
