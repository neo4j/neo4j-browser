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
import { combineEpics } from 'redux-observable'

import {
  fetchGuideFromAllowlistEpic,
  handleCommandEpic,
  handleSingleCommandEpic,
  postConnectCmdEpic
} from './modules/commands/commandsDuck'
import {
  connectEpic,
  connectionLostEpic,
  detectActiveConnectionChangeEpic,
  disconnectEpic,
  disconnectSuccessEpic,
  initialSwitchConnectionFailEpic,
  retainCredentialsSettingsEpic,
  silentDisconnectEpic,
  startupConnectEpic,
  startupConnectionFailEpic,
  startupConnectionSuccessEpic,
  switchConnectionEpic,
  switchConnectionFailEpic,
  switchConnectionSuccessEpic,
  useDbEpic,
  verifyConnectionCredentialsEpic
} from './modules/connections/connectionsDuck'
import { credentialsTimeoutEpic } from './modules/credentialsPolicy/credentialsPolicyDuck'
import {
  clearCurrentUserOnDisconnectEpic,
  getCurrentUserEpic
} from './modules/currentUser/currentUserDuck'
import {
  adHocCypherRequestEpic,
  clusterCypherRequestEpic,
  cypherRequestEpic,
  handleForcePasswordChangeEpic,
  routedCypherRequestEpic
} from './modules/cypher/cypherDuck'
import {
  clearMetaOnDisconnectEpic,
  dbMetaEpic,
  dbCountEpic,
  serverConfigEpic
} from './modules/dbMeta/dbMetaEpics'
import {
  discoveryOnStartupEpic,
  injectDiscoveryEpic
} from './modules/discovery/discoveryDuck'
import {
  initializeCypherEditorEpic,
  populateEditorFromUrlEpic,
  updateEditorSupportSchemaEpic
} from './modules/editor/editorDuck'
import { clearOnDisconnectEpic } from './modules/features/featuresDuck'
import { ensureMaxFramesEpic } from './modules/frames/framesDuck'
import { fetchRemoteGuideEpic } from './modules/guides/guidesDuck'
import { clearLocalstorageEpic } from './modules/localstorage/localstorageDuck'
import { cancelRequestEpic } from './modules/requests/requestsDuck'
import {
  clearSyncEpic,
  loadFavoritesFromSyncEpic,
  loadFoldersFromSyncEpic,
  loadGrassFromSyncEpic,
  syncFavoritesEpic,
  syncFoldersEpic,
  syncGrassEpic,
  syncItemsEpic
} from './modules/sync/syncDuck'
import {
  trackCommandUsageEpic,
  trackErrorFramesEpic,
  trackReduxActionsEpic,
  udcStartupEpic
} from './modules/udc/udcDuck'

export default combineEpics(
  handleCommandEpic,
  handleSingleCommandEpic,
  postConnectCmdEpic,
  fetchGuideFromAllowlistEpic,
  connectionLostEpic,
  switchConnectionEpic,
  switchConnectionSuccessEpic,
  switchConnectionFailEpic,
  initialSwitchConnectionFailEpic,
  retainCredentialsSettingsEpic,
  connectEpic,
  disconnectEpic,
  silentDisconnectEpic,
  useDbEpic,
  startupConnectEpic,
  disconnectSuccessEpic,
  verifyConnectionCredentialsEpic,
  startupConnectionSuccessEpic,
  startupConnectionFailEpic,
  detectActiveConnectionChangeEpic,
  dbMetaEpic,
  dbCountEpic,
  serverConfigEpic,
  clearMetaOnDisconnectEpic,
  cancelRequestEpic,
  discoveryOnStartupEpic,
  injectDiscoveryEpic,
  populateEditorFromUrlEpic,
  adHocCypherRequestEpic,
  routedCypherRequestEpic,
  cypherRequestEpic,
  clusterCypherRequestEpic,
  clearLocalstorageEpic,
  handleForcePasswordChangeEpic,
  clearOnDisconnectEpic,
  syncFavoritesEpic,
  loadFavoritesFromSyncEpic,
  loadGrassFromSyncEpic,
  syncItemsEpic,
  clearSyncEpic,
  loadFoldersFromSyncEpic,
  syncFoldersEpic,
  syncGrassEpic,
  credentialsTimeoutEpic,
  udcStartupEpic,
  ensureMaxFramesEpic,
  getCurrentUserEpic,
  clearCurrentUserOnDisconnectEpic,
  trackCommandUsageEpic,
  trackErrorFramesEpic,
  trackReduxActionsEpic,
  initializeCypherEditorEpic,
  updateEditorSupportSchemaEpic,
  fetchRemoteGuideEpic
)
