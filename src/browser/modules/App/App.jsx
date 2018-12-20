/*
 * Copyright (c) 2002-2018 "Neo4j, Inc"
 * Network Engine for Objects in Lund AB [http://neotechnology.com]
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
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withBus } from 'react-suber'
import { ThemeProvider } from 'styled-components'
import { hot } from 'react-hot-loader'
import * as themes from 'browser/styles/themes'
import {
  getTheme,
  getCmdChar,
  getBrowserSyncConfig
} from 'shared/modules/settings/settingsDuck'
import { FOCUS, EXPAND } from 'shared/modules/editor/editorDuck'
import { useBrowserSync } from 'shared/modules/features/featuresDuck'
import { getErrorMessage } from 'shared/modules/commands/commandsDuck'
import { allowOutgoingConnections } from 'shared/modules/dbMeta/dbMetaDuck'
import {
  getActiveConnection,
  getConnectionState,
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
import DesktopIntegration from 'browser-components/DesktopIntegration'
import {
  getActiveGraph,
  buildConnectionCredentialsObject
} from 'browser-components/DesktopIntegration/helpers'
import { getMetadata, getUserAuthStatus } from 'shared/modules/sync/syncDuck'
import ErrorBoundary from 'browser-components/ErrorBoundary'
import { getExperimentalFeatures } from 'shared/modules/experimentalFeatures/experimentalFeaturesDuck'
import FeatureToggleProvider from '../FeatureToggle/FeatureToggleProvider'
import { URL_ARGUMENTS_CHANGE } from 'shared/modules/app/appDuck'

export class App extends Component {
  componentDidMount () {
    document.addEventListener('keyup', this.focusEditorOnSlash)
    document.addEventListener('keyup', this.expandEditorOnEsc)
  }
  componentWillUnmount () {
    document.removeEventListener('keyup', this.focusEditorOnSlash)
    document.removeEventListener('keyup', this.expandEditorOnEsc)
  }

  focusEditorOnSlash = e => {
    if (['INPUT', 'TEXTAREA'].indexOf(e.target.tagName) > -1) return
    if (e.key !== '/') return
    this.props.bus && this.props.bus.send(FOCUS)
  }
  expandEditorOnEsc = e => {
    if (e.keyCode !== 27) return
    this.props.bus && this.props.bus.send(EXPAND)
  }
  render () {
    const {
      drawer,
      cmdchar,
      handleNavClick,
      activeConnection,
      connectionState,
      theme,
      errorMessage,
      loadExternalScripts,
      loadSync,
      syncConsent,
      browserSyncMetadata,
      browserSyncConfig,
      browserSyncAuthStatus,
      experimentalFeatures
    } = this.props
    const themeData = themes[theme] || themes['normal']

    return (
      <ErrorBoundary>
        <ThemeProvider theme={themeData}>
          <FeatureToggleProvider features={experimentalFeatures}>
            <StyledWrapper>
              <DocTitle titleString={this.props.titleString} />
              <UserInteraction />
              <DesktopIntegration
                integrationPoint={this.props.desktopIntegrationPoint}
                onArgumentsChange={this.props.onArgumentsChange}
                onMount={this.props.setInitialConnectionData}
                onGraphActive={this.props.switchConnection}
                onGraphInactive={this.props.closeConnectionMaybe}
              />
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
                      errorMessage={errorMessage}
                      useBrowserSync={loadSync}
                    />
                  </StyledMainWrapper>
                </StyledBody>
              </StyledApp>
            </StyledWrapper>
          </FeatureToggleProvider>
        </ThemeProvider>
      </ErrorBoundary>
    )
  }
}

const mapStateToProps = state => {
  const connectionData = getActiveConnectionData(state)
  return {
    experimentalFeatures: getExperimentalFeatures(state),
    drawer: state.drawer,
    activeConnection: getActiveConnection(state),
    theme: getTheme(state),
    connectionState: getConnectionState(state),
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
    loadSync: useBrowserSync(state)
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
  const switchConnection = async (
    event,
    newContext,
    oldContext,
    getKerberosTicket
  ) => {
    const connectionCreds = await buildConnectionCredentialsObject(
      newContext,
      stateProps.defaultConnectionData,
      getKerberosTicket
    )
    ownProps.bus.send(SWITCH_CONNECTION, connectionCreds)
  }
  const setInitialConnectionData = async (
    graph,
    credentials,
    context,
    getKerberosTicket
  ) => {
    const connectionCreds = await buildConnectionCredentialsObject(
      context,
      stateProps.defaultConnectionData,
      getKerberosTicket
    )
    // No connection. Probably no graph active.
    if (!connectionCreds) {
      ownProps.bus.send(SWITCH_CONNECTION_FAILED)
      return
    }
    ownProps.bus.send(INJECTED_DISCOVERY, connectionCreds)
  }
  const closeConnectionMaybe = (event, newContext, oldContext) => {
    const activeGraph = getActiveGraph(newContext)
    if (activeGraph) return // We still got an active graph, do nothing
    ownProps.bus.send(SILENT_DISCONNECT, {})
  }
  const onArgumentsChange = argsString => {
    ownProps.bus.send(URL_ARGUMENTS_CHANGE, { url: `?${argsString}` })
  }
  return {
    ...stateProps,
    ...ownProps,
    ...dispatchProps,
    switchConnection,
    setInitialConnectionData,
    closeConnectionMaybe,
    onArgumentsChange
  }
}

export default hot(module)(
  withBus(
    connect(
      mapStateToProps,
      mapDispatchToProps,
      mergeProps
    )(App)
  )
)
