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
import React, { useEffect, useCallback, useRef } from 'react'
import { connect } from 'react-redux'
import { withBus } from 'react-suber'
import { ThemeProvider } from 'styled-components'
import * as themes from 'browser/styles/themes'
import {
  getTheme,
  getBrowserSyncConfig,
  codeFontLigatures,
  LIGHT_THEME
} from 'shared/modules/settings/settingsDuck'
import { FOCUS, EXPAND } from 'shared/modules/editor/editorDuck'
import { utilizeBrowserSync } from 'shared/modules/features/featuresDuck'
import { getOpenDrawer } from 'shared/modules/sidebar/sidebarDuck'
import { getErrorMessage } from 'shared/modules/commands/commandsDuck'
import {
  allowOutgoingConnections,
  getDatabases
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
import Render from 'browser-components/Render'
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
import { METRICS_EVENT } from 'shared/modules/udc/udcDuck'
import { useKeyboardShortcuts } from './keyboardShortcuts'

export function App(props) {
  const [derivedTheme, setEnvironmentTheme] = useDerivedTheme(
    props.theme,
    LIGHT_THEME
  )
  const themeData = themes[derivedTheme] || themes[LIGHT_THEME]

  useKeyboardShortcuts(props.bus)

  const eventMetricsCallback = useRef(() => {})

  useEffect(() => {
    const unsub =
      props.bus &&
      props.bus.take(METRICS_EVENT, ({ category, label, data }) => {
        eventMetricsCallback &&
          eventMetricsCallback.current &&
          eventMetricsCallback.current({ category, label, data })
      })
    return () => unsub && unsub()
  }, [])

  const {
    drawer,
    handleNavClick,
    activeConnection,
    connectionState,
    lastConnectionUpdate,
    errorMessage,
    loadExternalScripts,
    loadSync,
    syncConsent,
    browserSyncMetadata,
    browserSyncConfig,
    browserSyncAuthStatus,
    experimentalFeatures,
    store,
    codeFontLigatures,
    defaultConnectionData,
    useDb,
    databases
  } = props

  const wrapperClassNames = []
  if (!codeFontLigatures) {
    wrapperClassNames.push('disable-font-ligatures')
  }
  const setEventMetricsCallback = fn => {
    eventMetricsCallback.current = fn
  }

  return (
    <ErrorBoundary>
      <DesktopApi
        onMount={(...args) => {
          buildConnectionCreds(...args, { defaultConnectionData })
            .then(creds => props.bus.send(INJECTED_DISCOVERY, creds))
            .catch(() => props.bus.send(INITIAL_SWITCH_CONNECTION_FAILED))
          getDesktopTheme(...args)
            .then(theme => setEnvironmentTheme(theme))
            .catch(setEnvironmentTheme(null))
        }}
        onGraphActive={(...args) => {
          buildConnectionCreds(...args, { defaultConnectionData })
            .then(creds => props.bus.send(SWITCH_CONNECTION, creds))
            .catch(e => props.bus.send(SWITCH_CONNECTION_FAILED))
        }}
        onGraphInactive={() => props.bus.send(SILENT_DISCONNECT)}
        onColorSchemeUpdated={(...args) =>
          getDesktopTheme(...args)
            .then(theme => setEnvironmentTheme(theme))
            .catch(setEnvironmentTheme(null))
        }
        onArgumentsChange={argsString =>
          props.bus.send(URL_ARGUMENTS_CHANGE, { url: `?${argsString}` })
        }
        setEventMetricsCallback={setEventMetricsCallback}
      />
      <ThemeProvider theme={themeData}>
        <FeatureToggleProvider features={experimentalFeatures}>
          <FileDrop store={store}>
            <StyledWrapper className={wrapperClassNames}>
              <DocTitle titleString={props.titleString} />
              <UserInteraction />
              <Render if={loadExternalScripts}>
                <Intercom appID="lq70afwx" />
              </Render>
              <Render if={syncConsent && loadExternalScripts && loadSync}>
                <BrowserSyncInit
                  authStatus={browserSyncAuthStatus}
                  authData={browserSyncMetadata}
                  config={browserSyncConfig}
                />
              </Render>
              <StyledApp>
                <StyledBody>
                  <ErrorBoundary>
                    <Sidebar openDrawer={drawer} onNavClick={handleNavClick} />
                  </ErrorBoundary>
                  <StyledMainWrapper>
                    <Main
                      activeConnection={activeConnection}
                      connectionState={connectionState}
                      lastConnectionUpdate={lastConnectionUpdate}
                      errorMessage={errorMessage}
                      utilizeBrowserSync={loadSync}
                      useDb={useDb}
                      databases={databases}
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

const mapStateToProps = state => {
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
      allowOutgoingConnections(state) !== false && isConnected(state),
    titleString: asTitleString(connectionData),
    defaultConnectionData: getConnectionData(state, CONNECTION_ID),
    syncConsent: state.syncConsent.consented,
    browserSyncMetadata: getMetadata(state),
    browserSyncConfig: getBrowserSyncConfig(state),
    browserSyncAuthStatus: getUserAuthStatus(state),
    loadSync: utilizeBrowserSync(state),
    isWebEnv: inWebEnv(state),
    useDb: getUseDb(state),
    databases: getDatabases(state)
  }
}

const mapDispatchToProps = dispatch => {
  return {
    handleNavClick: id => {
      dispatch(toggle(id))
    }
  }
}

export default withBus(connect(mapStateToProps, mapDispatchToProps)(App))
