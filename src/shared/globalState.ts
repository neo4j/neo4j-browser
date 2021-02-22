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

import {
  NAME as settings,
  initialState as settingsInitialState
} from './modules/settings/settingsDuck'
import {
  NAME as features,
  initialState as featuresInitialState
} from './modules/features/featuresDuck'
import { FramesState, NAME as frames } from './modules/stream/streamDuck'
import { NAME as history } from './modules/history/historyDuck'
import {
  NAME as user,
  initialState as userInitialState
} from './modules/currentUser/currentUserDuck'
import {
  NAME as meta,
  initialState as metaInitialState
} from './modules/dbMeta/dbMetaDuck'
import { NAME as documents, Favorite } from './modules/favorites/favoritesDuck'
import {
  NAME as connections,
  ConnectionReduxState
} from './modules/connections/connectionsDuck'
import { NAME as sidebar, SidebarState } from './modules/sidebar/sidebarDuck'
import { NAME as requests, RequestState } from './modules/requests/requestsDuck'
import { NAME as params } from './modules/params/paramsDuck'
import { NAME as grass } from './modules/grass/grassDuck'
import {
  NAME_CONSENT as syncConsent,
  NAME_META as syncMetadata,
  NAME as sync,
  initialConsentState,
  initialMetadataState,
  initialState as syncInitialState
} from './modules/sync/syncDuck'
import { NAME as folders, Folder } from './modules/favorites/foldersDuck'
import { NAME as commands } from './modules/commands/commandsDuck'
import { NAME as udc, udcState } from './modules/udc/udcDuck'
import { NAME as app } from './modules/app/appDuck'
import {
  NAME as experimentalFeatures,
  initialState as experimentalFeaturesInitialState
} from './modules/experimentalFeatures/experimentalFeaturesDuck'

export interface GlobalState {
  [settings]: typeof settingsInitialState
  [connections]: ConnectionReduxState
  [history]: string[]
  [requests]: RequestState
  [sidebar]: SidebarState
  [frames]: FramesState
  [features]: typeof featuresInitialState
  [user]: typeof userInitialState
  [meta]: typeof metaInitialState
  [documents]: Favorite[]
  [params]: Record<string, unknown>
  [grass]: unknown
  [sync]: typeof syncInitialState
  [syncMetadata]: typeof initialMetadataState
  [syncConsent]: typeof initialConsentState
  [folders]: Folder[]
  [commands]: unknown
  [udc]: udcState
  [app]: Record<string, unknown>
  [experimentalFeatures]: typeof experimentalFeaturesInitialState
}
