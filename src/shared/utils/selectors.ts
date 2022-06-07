import semver from 'semver'

import { GlobalState } from 'shared/globalState'
import { inDesktop } from 'shared/modules/app/appDuck'
import {
  isConnected,
  isConnectedAuraHost
} from 'shared/modules/connections/connectionsDuck'
import {
  getAllowOutgoingConnections,
  getClientsAllowTelemetry,
  isServerConfigDone,
  shouldAllowOutgoingConnections
} from 'shared/modules/dbMeta/dbMetaDuck'
import {
  getAllowCrashReports,
  getAllowUserStats
} from 'shared/modules/settings/settingsDuck'
import {
  allowUdcInAura,
  getAllowCrashReportsInDesktop,
  getAllowUserStatsInDesktop
} from 'shared/modules/udc/udcDuck'

export type TelemetrySettingSource =
  | 'AURA'
  | 'BROWSER_SETTING'
  | 'NEO4J_CONF'
  | 'DESKTOP_SETTING'
  | 'SETTINGS_NOT_LOADED'

function usedTelemetrySettingSource(
  state: GlobalState
): TelemetrySettingSource {
  if (!isConnected(state) || !isServerConfigDone(state)) {
    return 'SETTINGS_NOT_LOADED'
  }

  if (
    !shouldAllowOutgoingConnections(state) ||
    !getClientsAllowTelemetry(state)
  ) {
    return 'NEO4J_CONF'
  }

  if (inDesktop(state)) {
    return 'DESKTOP_SETTING'
  }

  if (isConnectedAuraHost(state) && allowUdcInAura(state) !== 'UNSET') {
    return 'AURA'
  }

  return 'BROWSER_SETTING'
}

export type TelemetrySettings = {
  allowUserStats: boolean
  allowCrashReporting: boolean
  source: TelemetrySettingSource
}
export const getTelemetrySettings = (state: GlobalState): TelemetrySettings => {
  const source = usedTelemetrySettingSource(state)
  const confAllowsUdc =
    getAllowOutgoingConnections(state) && getClientsAllowTelemetry(state)
  const auraAllowsUdc = allowUdcInAura(state) === 'ALLOW'

  const rules: Record<
    TelemetrySettingSource,
    {
      allowUserStats: boolean
      allowCrashReporting: boolean
    }
  > = {
    SETTINGS_NOT_LOADED: {
      allowCrashReporting: false,
      allowUserStats: false
    },
    DESKTOP_SETTING: {
      allowCrashReporting: getAllowCrashReportsInDesktop(state),
      allowUserStats: getAllowUserStatsInDesktop(state)
    },
    AURA: {
      allowCrashReporting: auraAllowsUdc,
      allowUserStats: auraAllowsUdc
    },
    BROWSER_SETTING: {
      allowCrashReporting: getAllowCrashReports(state),
      allowUserStats: getAllowUserStats(state)
    },
    NEO4J_CONF: {
      allowCrashReporting: confAllowsUdc,
      allowUserStats: confAllowsUdc
    }
  }

  return { source, ...rules[source] }
}
