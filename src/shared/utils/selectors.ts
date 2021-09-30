import { GlobalState } from 'shared/globalState'
import { inDesktop } from 'shared/modules/app/appDuck'
import {
  isConnected,
  isConnectedAuraHost
} from 'shared/modules/connections/connectionsDuck'
import {
  getAllowOutgoingConnections,
  getClientsAllowTelemetry,
  isServerConfigDone
} from 'shared/modules/dbMeta/dbMetaDuck'
import { allowUdcInAura } from 'shared/modules/udc/udcDuck'

export type TelemetrySettingSource =
  | 'AURA'
  | 'BROWSER_SETTING'
  | 'NEO4J_CONF'
  | 'DESKTOP_SETTING'
  | 'SETTINGS_NOT_LOADED'

export function usedTelemetrySettingSource(
  state: GlobalState
): TelemetrySettingSource {
  if (!isConnected(state) || !isServerConfigDone(state)) {
    return 'SETTINGS_NOT_LOADED'
  }

  if (!getAllowOutgoingConnections(state) || !getClientsAllowTelemetry(state)) {
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
