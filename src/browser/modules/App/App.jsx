/*
 * Copyright (c) 2002-2017 "Neo Technology,"
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

import { Component } from 'preact'
import { connect } from 'preact-redux'
import { withBus } from 'preact-suber'
import { ThemeProvider } from 'styled-components'
import * as themes from 'browser/styles/themes'
import { getTheme, getCmdChar } from 'shared/modules/settings/settingsDuck'
import { FOCUS, EXPAND } from 'shared/modules/editor/editorDuck'
import { wasUnknownCommand, getErrorMessage } from 'shared/modules/commands/commandsDuck'
import { allowOutgoingConnections } from 'shared/modules/dbMeta/dbMetaDuck'
import { getActiveConnection, getConnectionState, getActiveConnectionData } from 'shared/modules/connections/connectionsDuck'
import { toggle } from 'shared/modules/sidebar/sidebarDuck'

import { StyledWrapper, StyledApp, StyledBody, StyledMainWrapper } from './styled'
import Main from '../Main/Main'
import Sidebar from '../Sidebar/Sidebar'
import UserInteraction from '../UserInteraction'
import DocTitle from '../DocTitle'
import asTitleString from '../DocTitle/titleStringBuilder'
import Intercom from '../Intercom'
import Render from 'browser-components/Render'

class App extends Component {
  componentDidMount () {
    document.addEventListener('keyup', this.focusEditorOnSlash.bind(this))
    document.addEventListener('keyup', this.expandEditorOnEsc.bind(this))
  }
  componentWillUnmount () {
    document.removeEventListener('keyup', this.focusEditorOnSlash.bind(this))
    document.removeEventListener('keyup', this.expandEditorOnEsc.bind(this))
  }
  focusEditorOnSlash (e) {
    if (['INPUT', 'TEXTAREA'].indexOf(e.target.tagName) > -1) return
    if (e.key !== '/') return
    this.props.bus && this.props.bus.send(FOCUS)
  }
  expandEditorOnEsc (e) {
    if (e.keyCode !== 27) return
    this.props.bus && this.props.bus.send(EXPAND)
  }
  render () {
    const {drawer, cmdchar, handleNavClick, activeConnection, connectionState, theme, showUnknownCommandBanner, errorMessage, loadUdc} = this.props
    const themeData = themes[theme] || themes['normal']
    return (
      <ThemeProvider theme={themeData}>
        <StyledWrapper>
          <DocTitle titleString={this.props.titleString} />
          <UserInteraction />
          <Render if={loadUdc}>
            <Intercom appID='lq70afwx' />
          </Render>
          <StyledApp>
            <StyledBody>
              <Sidebar openDrawer={drawer} onNavClick={handleNavClick} />
              <StyledMainWrapper>
                <Main
                  cmdchar={cmdchar}
                  activeConnection={activeConnection}
                  connectionState={connectionState}
                  showUnknownCommandBanner={showUnknownCommandBanner}
                  errorMessage={errorMessage}
                />
              </StyledMainWrapper>
            </StyledBody>
          </StyledApp>
        </StyledWrapper>
      </ThemeProvider>
    )
  }
}

const mapStateToProps = (state) => {
  const connectionData = getActiveConnectionData(state)
  return {
    drawer: state.drawer,
    activeConnection: getActiveConnection(state),
    theme: getTheme(state),
    connectionState: getConnectionState(state),
    cmdchar: getCmdChar(state),
    showUnknownCommandBanner: wasUnknownCommand(state),
    errorMessage: getErrorMessage(state),
    loadUdc: allowOutgoingConnections(state),
    titleString: asTitleString(connectionData)
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    handleNavClick: (id) => {
      dispatch(toggle(id))
    }
  }
}

export default withBus(connect(mapStateToProps, mapDispatchToProps)(App))
