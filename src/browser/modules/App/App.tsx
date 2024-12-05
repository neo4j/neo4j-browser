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
import { useEffect, useRef } from 'react'
import { connect } from 'react-redux'
import { ThemeProvider } from 'browser/styles/ThemeProvider'
import { editor as monacoEditor } from 'monaco-editor'
import { useTheme } from 'browser/styles/ThemeProvider'

import asTitleString from '../DocTitle/titleStringBuilder'
import FeatureToggleProvider from '../FeatureToggle/FeatureToggleProvider'
import Main from '../Main/Main'
import Segment, { MetricsData } from '../Segment'
import Sidebar from '../Sidebar/Sidebar'
import BrowserSyncInit from '../Sync/BrowserSyncInit'
import UserInteraction from '../UserInteraction'
import PerformanceOverlay from './PerformanceOverlay'
import { useKeyboardShortcuts } from './keyboardShortcuts'
import ErrorBoundary from 'browser-components/ErrorBoundary'
import FileDrop from 'browser-components/FileDrop/FileDrop'
import DesktopApi from 'browser-components/desktop-api/desktop-api'
import {
  buildConnectionCreds,
  getDesktopTheme
} from 'browser-components/desktop-api/desktop-api.handlers'
import useDerivedTheme from 'browser-hooks/useDerivedTheme'
import { CannyLoader } from 'browser-services/canny'
import { version } from 'project-root/package.json'
import { isRunningE2ETest } from 'services/utils'
import { GlobalState } from 'shared/globalState'
import { URL_ARGUMENTS_CHANGE, inWebEnv } from 'shared/modules/app/appDuck'
import { getErrorMessage } from 'shared/modules/commands/commandsDuck'
import {
  INITIAL_SWITCH_CONNECTION_FAILED,
  SILENT_DISCONNECT,
  SWITCH_CONNECTION,
  SWITCH_CONNECTION_FAILED,
  getActiveConnection,
  getActiveConnectionData,
  getConnectionData,
  getConnectionState,
  getLastConnectionUpdate,
  getUseDb,
  isConnected,
  isConnectedAuraHost
} from 'shared/modules/connections/connectionsDuck'
import {
  findDatabaseByNameOrAlias,
  getEdition,
  getTrialStatus,
  isServerConfigDone,
  shouldAllowOutgoingConnections
} from 'shared/modules/dbMeta/dbMetaDuck'
import {
 
  INJECTED_DISCOVERY
} from 'shared/modules/discovery/discoveryDuck'
import { getExperimentalFeatures } from 'shared/modules/experimentalFeatures/experimentalFeaturesDuck'
import { utilizeBrowserSync } from 'shared/modules/features/featuresDuck'
import {
  LIGHT_THEME,
  codeFontLigatures,
  getBrowserSyncConfig,
  getTheme
} from 'shared/modules/settings/settingsDuck'
import { getOpenDrawer, open } from 'shared/modules/sidebar/sidebarDuck'
import { toggle } from 'shared/modules/sidebar/sidebarDuck'
import { getMetadata, getUserAuthStatus } from 'shared/modules/sync/syncDuck'
import {
  METRICS_EVENT,
  getConsentBannerShownCount,
  udcInit,
  updateUdcData,
  type UdcState
} from '../../../shared/modules/udc/udcDuck'
import { getTelemetrySettings } from 'shared/utils/selectors'

export const MAIN_WRAPPER_DOM_ID = 'MAIN_WRAPPER_DOM_ID'

declare let SEGMENT_KEY: string

export function App(props: any) {
  const { theme, setTheme } = useTheme()

  const [derivedTheme] = useDerivedTheme(theme, LIGHT_THEME)

  useEffect(() => {
    monacoEditor.setTheme(derivedTheme === 'dark' ? 'vs-dark' : 'vs-light')
  }, [derivedTheme])

  useKeyboardShortcuts(props.dispatch)

  const eventMetricsCallback = useRef((_: MetricsData) => _)
  const segmentTrackCallback = useRef((_: MetricsData) => _)

  useEffect(() => {
    const unsub =
      props.bus &&
      props.bus.take(
        'metrics/event',
        ({ category, label, data: originalData }: MetricsData) => {
          if (!isRunningE2ETest() && props.telemetrySettings.allowUserStats) {
            const data = {
              browserVersion: version,
              neo4jEdition: props.edition,
              connectedTo: props.connectedTo,
              ...originalData
            }
            eventMetricsCallback &&
              eventMetricsCallback.current &&
              eventMetricsCallback.current({ category, label, data })
            segmentTrackCallback &&
              segmentTrackCallback.current &&
              segmentTrackCallback.current({ category, label, data })
          }
        }
      )
    return () => unsub && unsub()
  }, [props.telemetrySettings.allowUserStats, props.bus])

  const {
    browserSyncAuthStatus,
    browserSyncConfig,
    browserSyncMetadata,
    bus,
    codeFontLigatures,
    connectionState,
    consentBannerShownCount,
    isDatabaseUnavailable,
    defaultConnectionData,
    drawer,
    errorMessage,
    experimentalFeatures,
    handleNavClick,
    lastConnectionUpdate,
    loadExternalScripts,
    loadSync,
    openSettingsDrawer,
    store,
    syncConsent,
    telemetrySettings,
    titleString,
    useDb,
    updateDesktopUDCSettings
  } = props

  useEffect(() => {
    document.title = titleString
  }, [titleString])

  const wrapperClassNames = codeFontLigatures ? '' : 'disable-font-ligatures'

  const handleDesktopTheme = (newTheme: string) => {
    setTheme(newTheme)
  }

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <DesktopApi
          onMount={(...args: any[]) => {
            const { allowSendStats, allowSendReports, trackingId } = args[1]
              ?.global?.settings || {
              allowSendReports: false,
              allowSendStats: false
            }
            updateDesktopUDCSettings({
              allowCrashReportsInDesktop: allowSendReports,
              allowUserStatsInDesktop: allowSendStats,
              desktopTrackingId: trackingId
            })

            buildConnectionCreds(...args, { defaultConnectionData })
              .then(creds => bus.send(INJECTED_DISCOVERY, creds))
              .catch(() => bus.send(INITIAL_SWITCH_CONNECTION_FAILED))

            getDesktopTheme(...args)
              .then(handleDesktopTheme)
              .catch(() => setTheme('system'))
          }}
          onGraphActive={(...args: any[]) => {
            buildConnectionCreds(...args, { defaultConnectionData })
              .then(creds => bus.send(SWITCH_CONNECTION, creds))
              .catch(() => bus.send(SWITCH_CONNECTION_FAILED))
          }}
          onGraphInactive={() => bus.send(SILENT_DISCONNECT)}
          onColorSchemeUpdated={(...args: any[]) =>
            getDesktopTheme(...args)
              .then(handleDesktopTheme)
              .catch(() => setTheme('system'))
          }
          onArgumentsChange={(argsString: any) => {
            bus.send(URL_ARGUMENTS_CHANGE, { url: `?${argsString}` })
          }}
          onApplicationSettingsSaved={(...args: any[]) => {
            const { allowSendStats, allowSendReports, trackingId } = args[1]
              ?.global?.settings || {
              allowSendReports: false,
              allowSendStats: false
            }
            updateDesktopUDCSettings({
              allowCrashReportsInDesktop: allowSendReports,
              allowUserStatsInDesktop: allowSendStats,
              desktopTrackingId: trackingId
            })
          }}
          setEventMetricsCallback={(fn: any) =>
            (eventMetricsCallback.current = fn)
          }
        />
        <PerformanceOverlay />
        <FeatureToggleProvider features={experimentalFeatures}>
          <FileDrop store={store}>
            <div className={`min-h-screen ${wrapperClassNames}`}>
              <UserInteraction />
              {loadExternalScripts && (
                <>
                  <Segment
                    segmentKey={SEGMENT_KEY}
                    setTrackCallback={(fn: any) =>
                      (segmentTrackCallback.current = fn)
                    }
                  />
                  <CannyLoader />
                </>
              )}
              {syncConsent && loadExternalScripts && loadSync && (
                <BrowserSyncInit
                  authStatus={browserSyncAuthStatus}
                  authData={browserSyncMetadata}
                  config={browserSyncConfig}
                />
              )}
              <div className="flex h-screen bg-background text-foreground">
                <div className="flex flex-1">
                  <ErrorBoundary>
                    <Sidebar
                      selectedDrawerName={drawer}
                      onNavClick={handleNavClick}
                    />
                  </ErrorBoundary>
                  <main id={MAIN_WRAPPER_DOM_ID} className="flex-1 overflow-hidden">
                    <Main
                      connectionState={connectionState}
                      lastConnectionUpdate={lastConnectionUpdate}
                      errorMessage={errorMessage}
                      useDb={useDb}
                      isDatabaseUnavailable={isDatabaseUnavailable}
                      openSettingsDrawer={openSettingsDrawer}
                      trialStatus={props.trialStatus}
                    />
                  </main>
                </div>
              </div>
            </div>
          </FileDrop>
        </FeatureToggleProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

const mapStateToProps = (state: GlobalState) => {
  const useDb = getUseDb(state)
  const isDatabaseUnavailable =
    useDb === null ||
    findDatabaseByNameOrAlias(state, useDb)?.status !== 'online'

  const connectionData = getActiveConnectionData(state)
  return {
    experimentalFeatures: getExperimentalFeatures(state),
    drawer: getOpenDrawer(state),
    activeConnection: getActiveConnection(state),
    theme: getTheme(state),
    codeFontLigatures: codeFontLigatures(state),
    connectionState: getConnectionState(state),
    lastConnectionUpdate: getLastConnectionUpdate(state),
    errorMessage: getErrorMessage(state),
    loadExternalScripts:
      shouldAllowOutgoingConnections(state) !== false && isConnected(state),
    titleString: asTitleString(connectionData),
    defaultConnectionData: getConnectionData(state),
    syncConsent: state.syncConsent.consented,
    browserSyncMetadata: getMetadata(state),
    browserSyncConfig: getBrowserSyncConfig(state),
    browserSyncAuthStatus: getUserAuthStatus(state),
    loadSync: utilizeBrowserSync(state),
    isWebEnv: inWebEnv(state),
    useDb,
    isDatabaseUnavailable,
    telemetrySettings: getTelemetrySettings(state),
    edition: isServerConfigDone(state) ? getEdition(state) : 'PENDING',
    connectedTo: isConnected(state)
      ? isConnectedAuraHost(state)
        ? 'AURA HOST'
        : 'NON-AURA HOST'
      : 'NOT CONNECTED',
    trialStatus: getTrialStatus(state)
  }
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    handleNavClick: (id: any) => {
      dispatch(toggle(id))
    },
    openSettingsDrawer: () => {
      dispatch(open('settings'))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App)
