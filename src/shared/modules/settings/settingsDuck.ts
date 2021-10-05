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
import { get } from 'lodash-es'

import { GlobalState } from 'shared/globalState'
import { APP_START, USER_CLEAR } from 'shared/modules/app/appDuck'

export const NAME = 'settings'
export const UPDATE = 'settings/UPDATE'
export const REPLACE = 'settings/REPLACE'
export const DISABLE_IMPLICIT_INIT_COMMANDS =
  'settings/DISABLE_IMPLICIT_INIT_COMMANDS'
export const TRACK_OPT_OUT_USER_STATS = 'settings/TRACK_OPT_OUT_USER_STATS'
export const TRACK_OPT_OUT_CRASH_REPORTS =
  'settings/TRACK_OPT_OUT_CRASH_REPORTS'

export const AUTO_THEME = 'auto'
export const LIGHT_THEME = 'normal'
export const OUTLINE_THEME = 'outline'
export const DARK_THEME = 'dark'

export const NEO4J_CLOUD_DOMAINS = ['neo4j.io']

export const getSettings = (state: any) => state[NAME]
export const getMaxHistory = (state: any) =>
  state[NAME].maxHistory || initialState.maxHistory
export const getInitCmd = (state: any) => (state[NAME].initCmd || '').trim()
export const getPlayImplicitInitCommands = (state: any) =>
  state[NAME].playImplicitInitCommands
export const getTheme = (state: any) => state[NAME].theme || initialState.theme
export const getUseBoltRouting = (state: any) =>
  state[NAME].useBoltRouting || initialState.useBoltRouting
export const getBrowserSyncConfig = (
  state: any,
  host = getSettings(state).browserSyncDebugServer
) => browserSyncConfig(host || undefined)
export const getMaxNeighbours = (state: GlobalState): number =>
  state[NAME].maxNeighbours || initialState.maxNeighbours
export const getMaxRows = (state: GlobalState): number =>
  state[NAME].maxRows || initialState.maxRows
export const getMaxFieldItems = (state: GlobalState): number =>
  get(state, [NAME, 'maxFieldItems'], initialState.maxFieldItems)
export const getInitialNodeDisplay = (state: GlobalState): number =>
  state[NAME].initialNodeDisplay || initialState.initialNodeDisplay
export const getScrollToTop = (state: any) => state[NAME].scrollToTop
export const shouldReportUdc = (state: any) =>
  state[NAME].shouldReportUdc !== false
export const shouldAutoComplete = (state: any) =>
  state[NAME].autoComplete !== false
export const shouldEditorLint = (state: any) => state[NAME].editorLint === true
export const shouldEnableMultiStatementMode = (state: any) =>
  state[NAME].enableMultiStatementMode
export const shouldshowPerformanceOverlay = (state: any): boolean =>
  state[NAME].showPerformanceOverlay === true

const browserSyncConfig = (host = 'https://auth.neo4j.com') => ({
  authWindowUrl: `${host}/indexNewBrowser.html`,
  silentAuthIframeUrl: `${host}/silentAuthNewBrowser.html`,
  delegationTokenIframeUrl: `${host}/getDelegationTokenNewBrowser.html`,
  logoutUrl: 'https://neo4j-sync.auth0.com/v2/logout',
  firebaseConfig: {
    apiKey: 'AIzaSyA1RwZMBWHxqRGyY3CK60leRkr56H6GHV4',
    databaseURL: 'https://fiery-heat-7952.firebaseio.com',
    messagingSenderId: '352959348981'
  }
})
export const getUseNewVisualization = (state: any) => state[NAME].useNewVis
export const shouldUseCypherThread = (state: any) => state[NAME].useCypherThread
export const getConnectionTimeout = (state: any) =>
  state[NAME].connectionTimeout || initialState.connectionTimeout
export const codeFontLigatures = (state: any) => state[NAME].codeFontLigatures
export const getAllowCrashReports = (state: GlobalState): boolean =>
  state[NAME].allowCrashReports ?? initialState.allowCrashReports
export const getAllowUserStats = (state: GlobalState): boolean =>
  state[NAME].allowUserStats ?? initialState.allowUserStats

export const initialState = {
  maxHistory: 30,
  theme: AUTO_THEME,
  initCmd: ':play start',
  playImplicitInitCommands: true,
  initialNodeDisplay: 300,
  maxNeighbours: 100,
  showSampleScripts: true,
  browserSyncDebugServer: null,
  maxRows: 1000,
  maxFieldItems: 500,
  shouldReportUdc: true,
  autoComplete: true,
  scrollToTop: true,
  maxFrames: 30,
  codeFontLigatures: true,
  useBoltRouting: false,
  editorLint: false,
  useCypherThread: true,
  enableMultiStatementMode: true,
  connectionTimeout: 30 * 1000, // 30 seconds
  showPerformanceOverlay: false,
  allowCrashReports: true,
  allowUserStats: true
}

export default function settings(state = initialState, action: any) {
  switch (action.type) {
    case APP_START:
      return { ...initialState, ...state }
    case UPDATE:
      return {
        ...state,
        ...action.state
      }
    case REPLACE:
      return {
        ...initialState,
        ...action.state
      }
    case USER_CLEAR:
      return initialState
    case DISABLE_IMPLICIT_INIT_COMMANDS:
      return { ...state, playImplicitInitCommands: false }
    default:
      return state
  }
}

export const update = (settings: any) => {
  return {
    type: UPDATE,
    state: settings
  }
}

export const replace = (settings: any) => {
  return {
    type: REPLACE,
    state: settings
  }
}
