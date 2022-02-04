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
import { v4 } from 'uuid'

import { USER_CLEAR } from '../app/appDuck'
import { GlobalState } from 'shared/globalState'

// Action types
export const NAME = 'udc'
const UPDATE_DATA = 'udc/UPDATE_DATA'
export const METRICS_EVENT = 'udc/METRICS_EVENT'
export const UDC_STARTUP = 'udc/STARTUP'
export const LAST_GUIDE_SLIDE = 'udc/LAST_GUIDE_SLIDE'

export const getAuraNtId = (state: GlobalState): string | undefined =>
  state[NAME].auraNtId
export const getUuid = (state: GlobalState): string =>
  state[NAME].uuid || initialState.uuid
export const getDesktopTrackingId = (state: GlobalState): string | undefined =>
  state[NAME].desktopTrackingId
export const getAllowUserStatsInDesktop = (state: GlobalState): boolean =>
  state[NAME].allowUserStatsInDesktop ?? initialState.allowUserStatsInDesktop
export const getAllowCrashReportsInDesktop = (state: GlobalState): boolean =>
  state[NAME].allowCrashReportsInDesktop ??
  initialState.allowCrashReportsInDesktop
export const getConsentBannerShownCount = (state: GlobalState): number =>
  state[NAME].consentBannerShownCount || initialState.consentBannerShownCount
export const allowUdcInAura = (
  state: GlobalState
): 'ALLOW' | 'DENY' | 'UNSET' => {
  const ntId = state[NAME].auraNtId
  if (typeof ntId === 'string') {
    // Set to empty empty string to disable
    if (ntId === '') {
      return 'DENY'
    } else {
      return 'ALLOW'
    }
  }

  return 'UNSET'
}
export const getLastSnapshotTime = (state: GlobalState) =>
  (state[NAME] && state[NAME].lastSnapshot) || initialState.lastSnapshot

export interface UdcState {
  lastSnapshot: number
  auraNtId?: string
  uuid: string
  consentBannerShownCount: number
  desktopTrackingId?: string
  allowUserStatsInDesktop: boolean
  allowCrashReportsInDesktop: boolean
  segmentKey?: string
}

export const initialState: UdcState = {
  lastSnapshot: 0,
  auraNtId: undefined,
  uuid: v4(),
  consentBannerShownCount: 0,
  desktopTrackingId: undefined,
  allowUserStatsInDesktop: false,
  allowCrashReportsInDesktop: false,
  segmentKey: undefined
}

// Reducer
export default function reducer(
  state = initialState,
  action: UpdateDataAction | { type: typeof USER_CLEAR }
): UdcState {
  switch (action.type) {
    case USER_CLEAR:
      return { ...initialState }
    case UPDATE_DATA:
      const { type, ...rest } = action
      return { ...state, ...rest }
    default:
      return state
  }
}
interface UdcInitAction {
  type: typeof UDC_STARTUP
}

export const udcInit = (): UdcInitAction => {
  return {
    type: UDC_STARTUP
  }
}

interface MetricsEvent {
  category: string
  label: string
  data?: unknown
}

interface MetricsEventAction extends MetricsEvent {
  type: typeof METRICS_EVENT
}

export const metricsEvent = (payload: MetricsEvent): MetricsEventAction => {
  return {
    type: METRICS_EVENT,
    ...payload
  }
}

interface UpdateDataAction extends Partial<UdcState> {
  type: typeof UPDATE_DATA
}

export const updateUdcData = (obj: Partial<UdcState>): UpdateDataAction => {
  return {
    type: UPDATE_DATA,
    ...obj
  }
}

export function cleanUdcFromStorage(stored?: UdcState): UdcState {
  if (!stored || typeof stored !== 'object' || Array.isArray(stored)) {
    return initialState
  }
  const {
    lastSnapshot,
    auraNtId,
    uuid,
    consentBannerShownCount,
    desktopTrackingId,
    allowUserStatsInDesktop,
    allowCrashReportsInDesktop,
    segmentKey
  } = stored

  // Todo keep old state around?
  return {
    lastSnapshot:
      typeof lastSnapshot === 'number'
        ? lastSnapshot
        : initialState.lastSnapshot,

    auraNtId: typeof auraNtId === 'string' ? auraNtId : initialState.auraNtId,

    uuid: typeof uuid === 'string' ? uuid : initialState.uuid,

    consentBannerShownCount:
      typeof consentBannerShownCount === 'number'
        ? consentBannerShownCount
        : initialState.consentBannerShownCount,

    desktopTrackingId:
      typeof desktopTrackingId === 'string'
        ? desktopTrackingId
        : initialState.desktopTrackingId,

    allowUserStatsInDesktop:
      typeof allowUserStatsInDesktop === 'boolean'
        ? allowUserStatsInDesktop
        : initialState.allowUserStatsInDesktop,

    allowCrashReportsInDesktop:
      typeof allowCrashReportsInDesktop === 'boolean'
        ? allowCrashReportsInDesktop
        : initialState.allowCrashReportsInDesktop,

    segmentKey:
      typeof segmentKey === 'string' ? segmentKey : initialState.segmentKey
  }
}
