/*
 * Copyright (c) 2002-2018 "Neo4j, Inc"
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

import { combineEpics } from 'redux-observable'
import {
  handleGroupCommandEpic,
  handleCommandsEpic,
  postConnectCmdEpic,
  fetchGuideFromWhitelistEpic
} from './modules/commands/commandsDuck'
import {
  retainCredentialsSettingsEpic,
  checkSettingsForRoutingDriver,
  connectEpic,
  disconnectEpic,
  startupConnectEpic,
  disconnectSuccessEpic,
  startupConnectionSuccessEpic,
  startupConnectionFailEpic,
  detectActiveConnectionChangeEpic,
  connectionLostEpic,
  switchConnectionEpic,
  switchConnectionSuccessEpic,
  switchConnectionFailEpic,
  silentDisconnectEpic
} from './modules/connections/connectionsDuck'
import {
  dbMetaEpic,
  serverConfigEpic,
  clearMetaOnDisconnectEpic
} from './modules/dbMeta/dbMetaDuck'
import { jmxEpic } from './modules/jmx/jmxDuck'
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
import { featuresDiscoveryEpic } from './modules/features/featuresDuck'
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

export default combineEpics(
  handleGroupCommandEpic,
  handleCommandsEpic,
  postConnectCmdEpic,
  fetchGuideFromWhitelistEpic,
  connectionLostEpic,
  switchConnectionEpic,
  switchConnectionSuccessEpic,
  switchConnectionFailEpic,
  retainCredentialsSettingsEpic,
  checkSettingsForRoutingDriver,
  connectEpic,
  jmxEpic,
  disconnectEpic,
  silentDisconnectEpic,
  startupConnectEpic,
  disconnectSuccessEpic,
  startupConnectionSuccessEpic,
  startupConnectionFailEpic,
  detectActiveConnectionChangeEpic,
  dbMetaEpic,
  serverConfigEpic,
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
  maxFramesConfigEpic
)
