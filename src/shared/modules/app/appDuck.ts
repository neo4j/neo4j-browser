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

export const SECURE_SCHEMES = ['neo4j+s', 'bolt+s']
export const INSECURE_SCHEMES = ['neo4j', 'bolt']
export const CLOUD_SCHEMES = ['neo4j+s']

// Selectors
export const getHostedUrl = (state: any) =>
  (state[NAME] || {}).hostedUrl || null
export const getEnv = (state: any) => (state[NAME] || {}).env || WEB
export const hasDiscoveryEndpoint = (state: any) =>
  [WEB, CLOUD].includes(getEnv(state))
export const inWebEnv = (state: any) => getEnv(state) === WEB
export const inCloudEnv = (state: any) => getEnv(state) === CLOUD
export const inWebBrowser = (state: any) => [WEB, CLOUD].includes(getEnv(state))
export const inDesktop = (state: any) => getEnv(state) === DESKTOP
export const getGitRevision = (state: any): string | null =>
  state[NAME].gitRevision ?? null
export const getBuiltAt = (state: any): string | null =>
  state[NAME].builtAt ?? null

export const getAllowedBoltSchemes = (state: any, encryptionFlag?: any) => {
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
export const isRelateAvailable = (state: any) =>
  state[NAME].relateUrl &&
  state[NAME].relateApiToken &&
  state[NAME].relateProjectId
export const getProjectId = (state: any) => state[NAME].relateProjectId

// action creators
export const updateBuildInfo = (action: {
  gitRevision: string
  builtAt: string
}) => ({
  type: UPDATE_BUILD_INFO,
  gitRevision: action.gitRevision,
  builtAt: action.builtAt
})

// Reducer
export default function reducer(state = { hostedUrl: null }, action: any) {
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
    case UPDATE_BUILD_INFO:
      return {
        ...state,
        builtAt: action.builtAt,
        gitRevision: action.gitRevision
      }
    default:
      return state
  }
}
