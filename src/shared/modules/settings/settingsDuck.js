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
import { get } from 'lodash-es'

import { APP_START, USER_CLEAR } from 'shared/modules/app/appDuck'

export const NAME = 'settings'
export const UPDATE = 'settings/UPDATE'
export const REPLACE = 'settings/REPLACE'
export const DISABLE_IMPLICIT_INIT_COMMANDS =
  'settings/DISABLE_IMPLICIT_INIT_COMMANDS'

export const AUTO_THEME = 'auto'
export const LIGHT_THEME = 'normal'
export const OUTLINE_THEME = 'outline'
export const DARK_THEME = 'dark'

export const NEO4J_CLOUD_DOMAINS = ['neo4j.io']

export const getSettings = state => state[NAME]
export const getMaxHistory = state =>
  state[NAME].maxHistory || initialState.maxHistory
export const getInitCmd = state => (state[NAME].initCmd || '').trim()
export const getPlayImplicitInitCommands = state =>
  state[NAME].playImplicitInitCommands
export const getTheme = state => state[NAME].theme || initialState.theme
export const getUseBoltRouting = state =>
  state[NAME].useBoltRouting || initialState.useBoltRouting
export const getBrowserSyncConfig = (
  state,
  host = getSettings(state).browserSyncDebugServer
) => browserSyncConfig(host || undefined)
export const getMaxNeighbours = state =>
  state[NAME].maxNeighbours || initialState.maxNeighbours
export const getMaxRows = state => state[NAME].maxRows || initialState.maxRows
export const getMaxFieldItems = state =>
  get(state, [NAME, 'maxFieldItems'], initialState.maxFieldItems)
export const getInitialNodeDisplay = state =>
  state[NAME].initialNodeDisplay || initialState.initialNodeDisplay
export const getScrollToTop = state => state[NAME].scrollToTop
export const shouldReportUdc = state => state[NAME].shouldReportUdc !== false
export const shouldAutoComplete = state => state[NAME].autoComplete !== false
export const shouldEditorLint = state => state[NAME].editorLint === true
export const shouldEnableMultiStatementMode = state =>
  state[NAME].enableMultiStatementMode

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
export const getUseNewVisualization = state => state[NAME].useNewVis
export const getCmdChar = state => state[NAME].cmdchar || initialState.cmdchar
export const shouldEditorAutocomplete = state =>
  state[NAME].editorAutocomplete !== false
export const shouldUseCypherThread = state => state[NAME].useCypherThread
export const getConnectionTimeout = state =>
  state[NAME].connectionTimeout || initialState.connectionTimeout
export const codeFontLigatures = state => state[NAME].codeFontLigatures

const initialState = {
  cmdchar: ':',
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
  editorAutocomplete: true,
  editorLint: false,
  useCypherThread: true,
  enableMultiStatementMode: true,
  connectionTimeout: 30 * 1000 // 30 seconds
}

export default function settings(state = initialState, action) {
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

export const update = settings => {
  return {
    type: UPDATE,
    state: settings
  }
}

export const replace = settings => {
  return {
    type: REPLACE,
    state: settings
  }
}
