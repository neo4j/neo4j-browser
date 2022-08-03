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

import { GlobalState } from 'shared/globalState'

// Action type constants
export const NAME = 'app'
export const APP_START = 'app/APP_START'
export const UPDATE_BUILD_INFO = 'app/UPDATE_BUILD_INFO'
export const USER_CLEAR = 'app/USER_CLEAR'
export type AppStartAction = { type: typeof APP_START }
export type UserClearAction = { type: typeof USER_CLEAR }

export const URL_ARGUMENTS_CHANGE = 'app/URL_ARGUMENTS_CHANGE'

// State constants
export const DESKTOP = 'DESKTOP'
export const WEB = 'WEB'
export const CLOUD = 'CLOUD'
export type Environment = typeof DESKTOP | typeof WEB | typeof CLOUD

export const SECURE_SCHEMES = ['neo4j+s', 'bolt+s']
export const INSECURE_SCHEMES = ['neo4j', 'bolt']
export const CLOUD_SCHEMES = ['neo4j+s']

// Selectors
export const getHostedUrl = (state: GlobalState): string | null =>
  (state[NAME] || {}).hostedUrl || null
export const getEnv = (state: GlobalState): Environment =>
  (state[NAME] || {}).env || WEB
export const hasDiscoveryEndpoint = (state: GlobalState): boolean =>
  [WEB, CLOUD].includes(getEnv(state))
export const inWebEnv = (state: GlobalState): boolean => getEnv(state) === WEB
export const inCloudEnv = (state: GlobalState): boolean =>
  getEnv(state) === CLOUD
export const inWebBrowser = (state: GlobalState): boolean =>
  [WEB, CLOUD].includes(getEnv(state))
export const inDesktop = (state: GlobalState): boolean =>
  getEnv(state) === DESKTOP

export const getAllowedBoltSchemes = (
  state: GlobalState,
  encryptionFlag?: any
) => {
  const isHosted = inWebBrowser(state)
  const hostedUrl = getHostedUrl(state)
  return !isHosted
    ? encryptionFlag
      ? SECURE_SCHEMES
      : [...SECURE_SCHEMES, ...INSECURE_SCHEMES]
    : (hostedUrl || '').startsWith('https')
    ? SECURE_SCHEMES
    : INSECURE_SCHEMES
}
// currently only Desktop specific
export const isRelateAvailable = (state: GlobalState): boolean =>
  Boolean(
    state[NAME].relateUrl &&
      state[NAME].relateApiToken &&
      state[NAME].relateProjectId
  )
export const getProjectId = (state: GlobalState): string | undefined =>
  state[NAME].relateProjectId

export type AppState = {
  hostedUrl?: string | null
  env?: Environment
  relateUrl?: string
  relateApiToken?: string
  relateProjectId?: string
  neo4jDesktopGraphAppId?: string
}

// Reducer
export default function reducer(
  state: AppState = { hostedUrl: null },
  action: any
): AppState {
  switch (action.type) {
    case APP_START:
      return {
        ...state,
        hostedUrl: action.url,
        env: action.env,
        relateUrl: action.relateUrl,
        relateApiToken: action.relateApiToken,
        relateProjectId: action.relateProjectId,
        neo4jDesktopGraphAppId: action.neo4jDesktopGraphAppId
      }
    default:
      return state
  }
}
