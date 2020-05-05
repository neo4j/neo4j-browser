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

import { combineEpics } from 'redux-observable'
import {
  handleCommandEpic,
  handleSingleCommandEpic,
  postConnectCmdEpic,
  fetchGuideFromWhitelistEpic
} from './modules/commands/commandsDuck'
import {
  retainCredentialsSettingsEpic,
  connectEpic,
  disconnectEpic,
  startupConnectEpic,
  disconnectSuccessEpic,
  verifyConnectionCredentialsEpic,
  startupConnectionSuccessEpic,
  startupConnectionFailEpic,
  detectActiveConnectionChangeEpic,
  connectionLostEpic,
  switchConnectionEpic,
  switchConnectionSuccessEpic,
  switchConnectionFailEpic,
  initialSwitchConnectionFailEpic,
  silentDisconnectEpic,
  useDbEpic
} from './modules/connections/connectionsDuck'
import {
  dbMetaEpic,
  serverConfigEpic,
  serverInfoEpic,
  clearMetaOnDisconnectEpic
} from './modules/dbMeta/dbMetaDuck'
import { cancelRequestEpic } from './modules/requests/requestsDuck'
import {
  discoveryOnStartupEpic,
  injectDiscoveryEpic
} from './modules/discovery/discoveryDuck'
import { clearLocalstorageEpic } from './modules/localstorage/localstorageDuck'
import { populateEditorFromUrlEpic } from './modules/editor/editorDuck'
import {
  adHocCypherRequestEpic,
  cypherRequestEpic,
  clusterCypherRequestEpic,
  handleForcePasswordChangeEpic
} from './modules/cypher/cypherDuck'
import {
  featuresDiscoveryEpic,
  clearOnDisconnectEpic
} from './modules/features/featuresDuck'
import {
  syncItemsEpic,
  clearSyncEpic,
  syncFavoritesEpic,
  loadFavoritesFromSyncEpic,
  loadGrassFromSyncEpic,
  loadFoldersFromSyncEpic,
  syncFoldersEpic,
  syncGrassEpic
} from './modules/sync/syncDuck'
import { credentialsTimeoutEpic } from './modules/credentialsPolicy/credentialsPolicyDuck'
import {
  bootEpic,
  incrementEventEpic,
  udcStartupEpic,
  trackSyncLogoutEpic,
  trackConnectsEpic,
  eventFiredEpic
} from './modules/udc/udcDuck'
import { maxFramesConfigEpic } from './modules/stream/streamDuck'
import {
  getCurrentUserEpic,
  clearCurrentUserOnDisconnectEpic
} from './modules/currentUser/currentUserDuck'

export default combineEpics(
  handleCommandEpic,
  handleSingleCommandEpic,
  postConnectCmdEpic,
  fetchGuideFromWhitelistEpic,
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
  serverConfigEpic,
  serverInfoEpic,
  clearMetaOnDisconnectEpic,
  cancelRequestEpic,
  discoveryOnStartupEpic,
  injectDiscoveryEpic,
  populateEditorFromUrlEpic,
  adHocCypherRequestEpic,
  cypherRequestEpic,
  clusterCypherRequestEpic,
  clearLocalstorageEpic,
  handleForcePasswordChangeEpic,
  featuresDiscoveryEpic,
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
  bootEpic,
  udcStartupEpic,
  incrementEventEpic,
  trackSyncLogoutEpic,
  trackConnectsEpic,
  eventFiredEpic,
  maxFramesConfigEpic,
  getCurrentUserEpic,
  clearCurrentUserOnDisconnectEpic
)
