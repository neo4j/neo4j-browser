/*
 * Copyright (c) 2002-2019 "Neo4j,"
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
import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import { withBus } from 'react-suber'
import { ThemeProvider } from 'styled-components'
import * as themes from 'browser/styles/themes'
import {
  getTheme,
  getCmdChar,
  getBrowserSyncConfig,
  codeFontLigatures,
  LIGHT_THEME
} from 'shared/modules/settings/settingsDuck'
import { FOCUS, EXPAND } from 'shared/modules/editor/editorDuck'
import { useBrowserSync } from 'shared/modules/features/featuresDuck'
import { getErrorMessage } from 'shared/modules/commands/commandsDuck'
import { allowOutgoingConnections } from 'shared/modules/dbMeta/dbMetaDuck'
import {
  getActiveConnection,
  getConnectionState,
  getLastConnectionUpdate,
  getActiveConnectionData,
  isConnected,
  getConnectionData,
  SILENT_DISCONNECT,
  SWITCH_CONNECTION,
  SWITCH_CONNECTION_FAILED
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
import { inWebEnv } from 'shared/modules/app/appDuck'
import useDerivedTheme from 'browser-hooks/useDerivedTheme'
import FileDrop from 'browser-components/FileDrop/FileDrop'
import {
  useWorkspaceData,
  useActiveGraphMonitor
} from 'browser-components/relate-api/relate-api.hooks'
import {
  getActiveGraphData,
  createConnectionCredentialsObject
} from 'browser-components/relate-api/relate-api.utils'

// <DesktopIntegration
//                 integrationPoint={props.desktopIntegrationPoint}
//                 onArgumentsChange={props.onArgumentsChange}
//                 onMount={(
//                   activeGraph,
//                   connectionsCredentials,
//                   context,
//                   getKerberosTicket
//                 ) => {
//                   props.setInitialConnectionData(
//                     activeGraph,
//                     connectionsCredentials,
//                     context,
//                     getKerberosTicket
//                   )
//                   detectDesktopThemeChanges(null, context)
//                 }}
//                 onGraphActive={props.switchConnection}
//                 onGraphInactive={props.closeConnectionMaybe}
//                 onColorSchemeUpdated={detectDesktopThemeChanges}
//               />

export function App (props) {
  const [derivedTheme, setEnvironmentTheme] = useDerivedTheme(
    props.theme,
    LIGHT_THEME
  )

  const workspaceData = useWorkspaceData()
  useEffect(
    () => {
      if (!workspaceData) {
        return
      }
      const activeGraph = getActiveGraphData(workspaceData)
      props.setInitialConnectionData(activeGraph)
    },
    [workspaceData]
  )
  const activeGraph = useActiveGraphMonitor()
  useEffect(
    () => {
      if (activeGraph === undefined) {
        // Not loaded yet
        return
      }
      if (activeGraph === null) {
        props.closeConnectionMaybe()
        return
      }
      props.switchConnection(activeGraph)
    },
    [activeGraph]
  )

  useEffect(() => {
    document.addEventListener('keyup', focusEditorOnSlash)
    document.addEventListener('keyup', expandEditorOnEsc)

    return () => {
      document.removeEventListener('keyup', focusEditorOnSlash)
      document.removeEventListener('keyup', expandEditorOnEsc)
    }
  }, [])

  const detectDesktopThemeChanges = (_, newContext) => {
    if (newContext.global.prefersColorScheme) {
      setEnvironmentTheme(newContext.global.prefersColorScheme)
    } else {
      setEnvironmentTheme(null)
    }
  }
  const themeData = themes[derivedTheme] || themes[LIGHT_THEME]

  const focusEditorOnSlash = e => {
    if (['INPUT', 'TEXTAREA'].indexOf(e.target.tagName) > -1) return
    if (e.key !== '/') return
    props.bus && props.bus.send(FOCUS)
  }
  const expandEditorOnEsc = e => {
    if (e.keyCode !== 27) return
    props.bus && props.bus.send(EXPAND)
  }

  const {
    drawer,
    cmdchar,
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
    codeFontLigatures
  } = props

  const wrapperClassNames = []
  if (!codeFontLigatures) {
    wrapperClassNames.push('disable-font-ligatures')
  }

  return (
    <ErrorBoundary>
      <ThemeProvider theme={themeData}>
        <FeatureToggleProvider features={experimentalFeatures}>
          <FileDrop store={store}>
            <StyledWrapper className={wrapperClassNames}>
              <DocTitle titleString={props.titleString} />
              <UserInteraction />
              <Render if={loadExternalScripts}>
                <Intercom appID='lq70afwx' />
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
                      cmdchar={cmdchar}
                      activeConnection={activeConnection}
                      connectionState={connectionState}
                      lastConnectionUpdate={lastConnectionUpdate}
                      errorMessage={errorMessage}
                      useBrowserSync={loadSync}
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
    drawer: state.drawer,
    activeConnection: getActiveConnection(state),
    theme: getTheme(state),
    codeFontLigatures: codeFontLigatures(state),
    connectionState: getConnectionState(state),
    lastConnectionUpdate: getLastConnectionUpdate(state),
    cmdchar: getCmdChar(state),
    errorMessage: getErrorMessage(state),
    loadExternalScripts:
      allowOutgoingConnections(state) !== false && isConnected(state),
    titleString: asTitleString(connectionData),
    defaultConnectionData: getConnectionData(state, CONNECTION_ID),
    syncConsent: state.syncConsent.consented,
    browserSyncMetadata: getMetadata(state),
    browserSyncConfig: getBrowserSyncConfig(state),
    browserSyncAuthStatus: getUserAuthStatus(state),
    loadSync: useBrowserSync(state),
    isWebEnv: inWebEnv(state)
  }
}

const mapDispatchToProps = dispatch => {
  return {
    handleNavClick: id => {
      dispatch(toggle(id))
    }
  }
}

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  const switchConnection = async activeGraph => {
    const connectionCreds = await createConnectionCredentialsObject(
      activeGraph,
      stateProps.defaultConnectionData
    )
    ownProps.bus.send(SWITCH_CONNECTION, connectionCreds)
  }
  const setInitialConnectionData = async activeGraph => {
    const connectionsCredentials = await createConnectionCredentialsObject(
      activeGraph,
      stateProps.defaultConnectionData
    )
    console.log('connectionsCredentials: ', connectionsCredentials)
    // No connection. Probably no graph active.
    if (!connectionsCredentials) {
      ownProps.bus.send(SWITCH_CONNECTION_FAILED)
      return
    }
    ownProps.bus.send(INJECTED_DISCOVERY, connectionsCredentials)
  }
  const closeConnectionMaybe = activeGraph => {
    if (activeGraph) return // We still got an active graph, do nothing
    ownProps.bus.send(SILENT_DISCONNECT, {})
  }

  return {
    ...stateProps,
    ...ownProps,
    ...dispatchProps,
    switchConnection,
    setInitialConnectionData,
    closeConnectionMaybe
  }
}

export default withBus(
  connect(
    mapStateToProps,
    mapDispatchToProps,
    mergeProps
  )(App)
)
