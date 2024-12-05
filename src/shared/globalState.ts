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
import { AppState } from './modules/app/appDuck'
import { ConnectionState } from './modules/connections/connectionsDuck'
import { FramesState } from './modules/frames/framesDuck'
import { GuideState } from './modules/guides/guidesDuck'
import { AuthState } from './modules/auth/authSlice'
import { SettingsState } from './modules/settings/settingsDuck'
import { RequestState } from './modules/requests/requestsDuck'
import { SidebarState } from './modules/sidebar/sidebarDuck'
import { Favorite } from './modules/favorites/favoritesDuck'
import { Folder } from './modules/favorites/foldersDuck'
import { neo4jApi } from './services/neo4jApi'
import { authApi } from './services/authApi'
import { EditorState } from './modules/editor/editorDuck'
import type { Database, ClientSettings, TrialStatus } from './modules/dbMeta/dbMetaDuck'

interface DbMetaState {
  nodes: number
  relationships: number
  labels: never[]
  relationshipTypes: never[]
  properties: never[]
  functions: never[]
  procedures: never[]
  role: null
  server: {
    version: null
    edition: null
    storeSize: null
  }
  databases: never[]
  serverConfigDone: boolean
  settings: ClientSettings
  countAutomaticRefresh: {
    enabled: boolean
    loading: boolean
  }
  trialStatus: {
    status: "unknown"
  }
}

export interface GlobalState {
  [neo4jApi.reducerPath]: ReturnType<typeof neo4jApi.reducer>
  [authApi.reducerPath]: ReturnType<typeof authApi.reducer>
  editor: EditorState
  settings: SettingsState
  connections: ConnectionState
  history: string[]
  requests: RequestState
  sidebar: SidebarState
  frames: FramesState
  features: {
    clientConfig: any
    browserSync: boolean
    userCapabilities: { [key: string]: boolean }
  }
  user: {
    username: any
    roles: any
  }
  meta: unknown
  documents: Favorite[]
  params: Record<string, unknown>
  grass: unknown
  sync: unknown
  syncMetadata: unknown
  syncConsent: {
    consented: boolean
  }
  folders: Folder[]
  commands: Record<string, never>
  app: AppState
  experimentalFeatures: unknown
  guides: GuideState
  auth: AuthState
  dbMeta: DbMetaState
}
