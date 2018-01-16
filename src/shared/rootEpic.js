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
import { featuresDiscoveryEpic } from './modules/features/featuresDuck'
import {
  syncItemsEpic,
  clearSyncEpic,
  syncFavoritesEpic,
  loadFavoritesFromSyncEpic,
  loadFoldersFromSyncEpic,
  syncFoldersEpic
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
  disconnectEpic,
  silentDisconnectEpic,
  startupConnectEpic,
  disconnectSuccessEpic,
  startupConnectionSuccessEpic,
  startupConnectionFailEpic,
  detectActiveConnectionChangeEpic,
  dbMetaEpic,
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
  syncItemsEpic,
  clearSyncEpic,
  loadFoldersFromSyncEpic,
  syncFoldersEpic,
  credentialsTimeoutEpic,
  bootEpic,
  udcStartupEpic,
  incrementEventEpic,
  trackSyncLogoutEpic,
  trackConnectsEpic,
  eventFiredEpic,
  maxFramesConfigEpic
)
