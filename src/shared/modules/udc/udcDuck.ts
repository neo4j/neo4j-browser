import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '../../rootReducer'

// Constants
export const METRICS_EVENT = 'metrics/event' as const

// Types
export interface UdcState {
  allowUserStats: boolean
  allowCrashReports: boolean
  consentBannerShownCount: number
  trackingId?: string
  allowUserStatsInDesktop: boolean
  allowCrashReportsInDesktop: boolean
  desktopTrackingId?: string
}

const initialState: UdcState = {
  allowUserStats: false,
  allowCrashReports: false,
  consentBannerShownCount: 0,
  allowUserStatsInDesktop: false,
  allowCrashReportsInDesktop: false
}

const udcSlice = createSlice({
  name: 'udc',
  initialState,
  reducers: {
    udcInit: state => state,
    updateUdcData: (state, action: PayloadAction<Partial<UdcState>>) => ({
      ...state,
      ...action.payload
    })
  }
})

// Selectors
export const getConsentBannerShownCount = (state: RootState): number => 
  state.udc.consentBannerShownCount

export const { udcInit, updateUdcData } = udcSlice.actions
export default udcSlice.reducer 