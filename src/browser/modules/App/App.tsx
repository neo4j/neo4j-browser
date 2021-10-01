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

import { editor } from 'monaco-editor'
import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import { withBus } from 'react-suber'
import { ThemeProvider } from 'styled-components'
import * as themes from 'browser/styles/themes'
import {
  getTheme,
  getBrowserSyncConfig,
  codeFontLigatures,
  LIGHT_THEME,
  getAllowCrashReports,
  getAllowUserStats
} from 'shared/modules/settings/settingsDuck'
import { utilizeBrowserSync } from 'shared/modules/features/featuresDuck'
import { getOpenDrawer, open } from 'shared/modules/sidebar/sidebarDuck'
import { getErrorMessage } from 'shared/modules/commands/commandsDuck'
import {
  shouldAllowOutgoingConnections,
  getDatabases,
  getClientsAllowTelemetry,
  getAllowOutgoingConnections
} from 'shared/modules/dbMeta/dbMetaDuck'
import {
  getActiveConnection,
  getConnectionState,
  getLastConnectionUpdate,
  getActiveConnectionData,
  isConnected,
  getConnectionData,
  INITIAL_SWITCH_CONNECTION_FAILED,
  SWITCH_CONNECTION_FAILED,
  SWITCH_CONNECTION,
  SILENT_DISCONNECT,
  getUseDb
} from 'shared/modules/connections/connectionsDuck'
import { toggle } from 'shared/modules/sidebar/sidebarDuck'
import {
  CONNECTION_ID,
  INJECTED_DISCOVERY
} from 'shared/modules/discovery/discoveryDuck'
import {
  StyledWrapper,
  StyledApp,
  StyledBody,
  StyledMainWrapper
} from './styled'
import Main from '../Main/Main'
import Sidebar from '../Sidebar/Sidebar'
import UserInteraction from '../UserInteraction'
import DocTitle from '../DocTitle'
import asTitleString from '../DocTitle/titleStringBuilder'
import Intercom from '../Intercom'
import Segment, { MetricsData } from '../Segment'
import { CannyLoader } from 'browser-services/canny'

import BrowserSyncInit from '../Sync/BrowserSyncInit'
import { getMetadata, getUserAuthStatus } from 'shared/modules/sync/syncDuck'
import ErrorBoundary from 'browser-components/ErrorBoundary'
import { getExperimentalFeatures } from 'shared/modules/experimentalFeatures/experimentalFeaturesDuck'
import FeatureToggleProvider from '../FeatureToggle/FeatureToggleProvider'
import { inWebEnv, URL_ARGUMENTS_CHANGE } from 'shared/modules/app/appDuck'
import useDerivedTheme from 'browser-hooks/useDerivedTheme'
import FileDrop from 'browser-components/FileDrop/FileDrop'
import DesktopApi from 'browser-components/desktop-api/desktop-api'
import {
  buildConnectionCreds,
  getDesktopTheme
} from 'browser-components/desktop-api/desktop-api.handlers'
import {
  allowUdcInAura,
  getConsentBannerShownCount,
  METRICS_EVENT,
  udcInit,
  updateUdcData
} from 'shared/modules/udc/udcDuck'
import { useKeyboardShortcuts } from './keyboardShortcuts'
import PerformanceOverlay from './PerformanceOverlay'
import { isRunningE2ETest } from 'services/utils'
import { version } from 'project-root/package.json'
import { GlobalState } from 'shared/globalState'
import { Bus } from 'suber'
import {
  usedTelemetrySettingSource,
  TelemetrySettingSource
} from 'shared/utils/selectors'
export const MAIN_WRAPPER_DOM_ID = 'MAIN_WRAPPER_DOM_ID'

declare let SEGMENT_KEY: string

type AppState = {
  desktopAllowsCrashReporting: boolean
  desktopAllowsUserStats: boolean
  desktopTrackingId?: string
}

export class App extends React.Component<any, AppState> {
  state: AppState = {
    desktopTrackingId: undefined,
    desktopAllowsCrashReporting: false,
    desktopAllowsUserStats: false
  }

  shouldSendMetricsData = () => {
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
        allowCrashReporting: this.state.desktopAllowsCrashReporting,
        allowUserStats: this.state.desktopAllowsUserStats
      },
      AURA: {
        allowCrashReporting: this.props.allowUdcInAura,
        allowUserStats: this.props.allowUdcInAura
      },
      BROWSER_SETTING: {
        allowCrashReporting: this.props.browserAllowCrashReports,
        allowUserStats: this.props.browserAllowUserStats
      },
      NEO4J_CONF: {
        allowCrashReporting: this.props.neo4jConfAllowsUdc,
        allowUserStats: this.props.neo4jConfAllowsUdc
      }
    }

    return rules[this.props.telemetrySettingSource as TelemetrySettingSource]
  }

  eventMetricsCallback = (_: MetricsData) => {}
  segmentTrackCallback = (_: MetricsData) => {}
  unsub = () => {}

  eventHandler = ({ category, label, data: originalData }: MetricsData) => {
    if (!isRunningE2ETest() && this.shouldSendMetricsData()) {
      const data = {
        browserVersion: version,
        ...originalData
      }
      this.eventMetricsCallback({ category, label, data })
      this.segmentTrackCallback({ category, label, data })
    }
  }

  componentDidMount() {
    const { bus } = this.props
    if (bus) {
      this.unsub = bus.take(METRICS_EVENT, this.eventHandler)
      const initAction = udcInit()
      bus && bus.send(initAction.type, initAction)
    }
  }
  componentWillUnmount() {
    this.unsub && this.unsub()
  }

  render() {
    const {
      activeConnection,
      browserSyncAuthStatus,
      browserSyncConfig,
      browserSyncMetadata,
      bus,
      codeFontLigatures,
      connectionState,
      consentBannerShownCount,
      databases,
      defaultConnectionData,
      drawer,
      errorMessage,
      experimentalFeatures,
      handleNavClick,
      lastConnectionUpdate,
      loadExternalScripts,
      loadSync,
      openSettingsDrawer,
      setConsentBannerShownCount,
      setEnvironmentTheme,
      store,
      syncConsent,
      telemetrySettingSource,
      themeData,
      titleString,
      useDb
    } = this.props

    const wrapperClassNames = codeFontLigatures ? '' : 'disable-font-ligatures'

    return (
      <ErrorBoundary>
        <DesktopApi
          onMount={(...args: any[]) => {
            const { allowSendStats, allowSendReports, trackingId } = args[1]
              ?.global?.settings || {
              allowSendReports: false,
              allowSendStats: false
            }
            this.setState({
              desktopAllowsCrashReporting: allowSendReports,
              desktopAllowsUserStats: allowSendStats,
              desktopTrackingId: trackingId
            })

            buildConnectionCreds(...args, { defaultConnectionData })
              .then(creds => bus.send(INJECTED_DISCOVERY, creds))
              .catch(() => bus.send(INITIAL_SWITCH_CONNECTION_FAILED))
            getDesktopTheme(...args)
              .then(theme => setEnvironmentTheme(theme))
              .catch(setEnvironmentTheme(null))
          }}
          onGraphActive={(...args: any[]) => {
            buildConnectionCreds(...args, { defaultConnectionData })
              .then(creds => bus.send(SWITCH_CONNECTION, creds))
              .catch(() => bus.send(SWITCH_CONNECTION_FAILED))
          }}
          onGraphInactive={() => bus.send(SILENT_DISCONNECT)}
          onColorSchemeUpdated={(...args: any[]) =>
            getDesktopTheme(...args)
              .then(theme => setEnvironmentTheme(theme))
              .catch(setEnvironmentTheme(null))
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
            this.setState({
              desktopAllowsCrashReporting: allowSendReports,
              desktopAllowsUserStats: allowSendStats,
              desktopTrackingId: trackingId
            })
          }}
          setEventMetricsCallback={(fn: any) =>
            (this.eventMetricsCallback = fn)
          }
        />
        <PerformanceOverlay />
        <ThemeProvider theme={themeData}>
          <FeatureToggleProvider features={experimentalFeatures}>
            <FileDrop store={store}>
              <StyledWrapper className={wrapperClassNames}>
                <DocTitle titleString={titleString} />
                <KeyboardShortcuts bus={bus} />
                <UserInteraction />
                {loadExternalScripts && (
                  <>
                    <Intercom appID="lq70afwx" />
                    <Segment
                      segmentKey={SEGMENT_KEY}
                      setTrackCallback={(fn: any) =>
                        (this.segmentTrackCallback = fn)
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
                <StyledApp>
                  <StyledBody>
                    <ErrorBoundary>
                      <Sidebar
                        openDrawer={drawer}
                        onNavClick={handleNavClick}
                      />
                    </ErrorBoundary>
                    <StyledMainWrapper id={MAIN_WRAPPER_DOM_ID}>
                      <Main
                        activeConnection={activeConnection}
                        connectionState={connectionState}
                        lastConnectionUpdate={lastConnectionUpdate}
                        errorMessage={errorMessage}
                        useDb={useDb}
                        databases={databases}
                        showUdcConsentBanner={
                          telemetrySettingSource === 'BROWSER_SETTING' &&
                          consentBannerShownCount <= 5
                        }
                        dismissConsentBanner={() =>
                          setConsentBannerShownCount(6)
                        }
                        incrementConsentBannerShownCount={() =>
                          setConsentBannerShownCount(
                            consentBannerShownCount + 1
                          )
                        }
                        openSettingsDrawer={openSettingsDrawer}
                      />
                    </StyledMainWrapper>
                  </StyledBody>
                </StyledApp>
              </StyledWrapper>
            </FileDrop>
          </FeatureToggleProvider>
        </ThemeProvider>
      </ErrorBoundary>
    )
  }
}

function ThemeHookAppWrapper(props: any) {
  const [derivedTheme, setEnvironmentTheme] = useDerivedTheme(
    props.theme,
    LIGHT_THEME
  )
  // @ts-expect-error ts-migrate(7053) FIXME: No index signature with a parameter of type 'strin... Remove this comment to see the full error message
  const themeData = themes[derivedTheme] || themes[LIGHT_THEME]

  // update cypher editor theme
  useEffect(() => {
    editor.setTheme(derivedTheme)
  }, [derivedTheme])
  return (
    <App
      themeData={themeData}
      setEnvironmentTheme={setEnvironmentTheme}
      {...props}
    />
  )
}

function KeyboardShortcuts({ bus }: { bus: Bus }) {
  useKeyboardShortcuts(bus)
  return null
}

const mapStateToProps = (state: GlobalState) => {
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
    defaultConnectionData: getConnectionData(state, CONNECTION_ID),
    syncConsent: state.syncConsent.consented,
    browserSyncMetadata: getMetadata(state),
    browserSyncConfig: getBrowserSyncConfig(state),
    browserSyncAuthStatus: getUserAuthStatus(state),
    loadSync: utilizeBrowserSync(state),
    isWebEnv: inWebEnv(state),
    useDb: getUseDb(state),
    databases: getDatabases(state),
    telemetrySettingSource: usedTelemetrySettingSource(state),
    auraAllowsUdc: allowUdcInAura(state) === 'ALLOW',
    neo4jConfAllowsUdc:
      getAllowOutgoingConnections(state) && getClientsAllowTelemetry(state),
    browserAllowCrashReports: getAllowCrashReports(state),
    browserAllowUserStats: getAllowUserStats(state),
    consentBannerShownCount: getConsentBannerShownCount(state)
  }
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    handleNavClick: (id: any) => {
      dispatch(toggle(id))
    },
    setConsentBannerShownCount: (consentBannerShownCount: number) => {
      dispatch(updateUdcData({ consentBannerShownCount }))
    },
    openSettingsDrawer: () => {
      dispatch(open('settings'))
    }
  }
}

export default withBus(
  connect(mapStateToProps, mapDispatchToProps)(ThemeHookAppWrapper)
)
