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
import { combineReducers } from '@reduxjs/toolkit'
import { neo4jApi } from './services/neo4jApi'
import { authApi } from './services/authApi'
import editorReducer from './modules/editor/editorDuck'
import connectionsReducer from './modules/connections/connectionsDuck'
import authReducer from './modules/auth/authSlice'
import appReducer, { NAME as app } from 'shared/modules/app/appDuck'
import commandsReducer, {
  NAME as commands
} from 'shared/modules/commands/commandsDuck'
import dbMetaReducer, { NAME as dbMeta } from 'shared/modules/dbMeta/dbMetaDuck'
import experimentalFeaturesReducer, {
  NAME as experimentalFeatures
} from 'shared/modules/experimentalFeatures/experimentalFeaturesDuck'
import favoritesReducer, {
  NAME as documents
} from 'shared/modules/favorites/favoritesDuck'
import foldersReducer, {
  NAME as folders
} from 'shared/modules/favorites/foldersDuck'
import featuresReducer, {
  NAME as features
} from 'shared/modules/features/featuresDuck'
import streamReducer, { NAME as stream } from 'shared/modules/frames/framesDuck'
import grassReducer, { NAME as grass } from 'shared/modules/grass/grassDuck'
import guideReducer, { NAME as guides } from 'shared/modules/guides/guidesDuck'
import historyReducer, {
  NAME as history
} from 'shared/modules/history/historyDuck'
import paramsReducer, { NAME as params } from 'shared/modules/params/paramsDuck'
import requestsReducer, {
  NAME as requests
} from 'shared/modules/requests/requestsDuck'
import settingsReducer, {
  NAME as settings
} from 'shared/modules/settings/settingsDuck'
import sidebarReducer, {
  NAME as sidebar
} from 'shared/modules/sidebar/sidebarDuck'
import {
  NAME as sync,
  NAME_CONSENT as syncConsent,
  syncConsentReducer,
  syncMetaDataReducer,
  NAME_META as syncMetadata,
  syncReducer
} from 'shared/modules/sync/syncDuck'
import userReducer, { NAME as currentUser } from 'shared/modules/currentUser/currentUserDuck'
import udcReducer from './modules/udc/udcDuck'

const rootReducer = combineReducers({
  [neo4jApi.reducerPath]: neo4jApi.reducer,
  [authApi.reducerPath]: authApi.reducer,
  editor: editorReducer,
  connections: connectionsReducer,
  auth: authReducer,
  [stream]: streamReducer,
  [settings]: settingsReducer,
  [features]: featuresReducer,
  [history]: historyReducer,
  [currentUser]: userReducer,
  [dbMeta]: dbMetaReducer,
  [documents]: favoritesReducer,
  [folders]: foldersReducer,
  [sidebar]: sidebarReducer,
  [params]: paramsReducer,
  [requests]: requestsReducer,
  [grass]: grassReducer,
  [sync]: syncReducer,
  [syncConsent]: syncConsentReducer,
  [syncMetadata]: syncMetaDataReducer,
  [commands]: commandsReducer,
  [app]: appReducer,
  [guides]: guideReducer,
  [experimentalFeatures]: experimentalFeaturesReducer,
  udc: udcReducer
})

export type RootState = ReturnType<typeof rootReducer>
export default rootReducer
