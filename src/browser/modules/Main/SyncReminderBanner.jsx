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
import { SyncDisconnectedBanner, SyncSignInBarButton, StyledCancelLink, StyledSyncReminderSpan, StyledSyncReminderButtonContainer } from './styled'
import { CONNECTED_STATE, getConnectionState } from 'shared/modules/connections/connectionsDuck'
import Visible from 'browser-components/Visible'
import BrowserSyncAuthWindow from '../Sync/BrowserSyncAuthWindow'
import { getBrowserSyncConfig } from 'shared/modules/settings/settingsDuck'
import SyncSignInManager from 'shared/modules/sync/SyncSignInManager'
import { setSync, optOutSync } from 'shared/modules/sync/syncDuck'

class SyncReminderBanner extends Component {
  componentWillMount () {
    this.syncManager = new SyncSignInManager({
      dbConfig: this.props.browserSyncConfig.firebaseConfig,
      serviceReadyCallback: this.serviceReady.bind(this),
      onSyncCallback: this.props.onSync
    })
  }
  serviceReady (status) {
    this.setState({status})
  }
  logIn () {
    BrowserSyncAuthWindow(this.props.browserSyncConfig.authWindowUrl, this.syncManager.authCallBack.bind(this.syncManager))
  }
  render () {
    const { dbConnectionState, syncConsent, sync, optOutSync } = this.props
    const dbConnected = dbConnectionState === CONNECTED_STATE
    const syncDisconnected = !sync || !sync.authData
    const syncConsentGiven = syncConsent && syncConsent.consented === true && !syncConsent.optedOut

    const visible = dbConnected && syncDisconnected && syncConsentGiven && this.state.status === 'UP'

    return (
      <Visible if={visible}>
        <SyncDisconnectedBanner height='100px'>
          <StyledSyncReminderSpan>You are currently not signed into Neo4j Browser Sync. Connect through a simple social sign-in to get started.</StyledSyncReminderSpan>
          <StyledSyncReminderButtonContainer>
            <SyncSignInBarButton onClick={this.logIn.bind(this)}>Sign In</SyncSignInBarButton>
            <StyledCancelLink onClick={() => optOutSync()}>X</StyledCancelLink>
          </StyledSyncReminderButtonContainer>
        </SyncDisconnectedBanner>
      </Visible>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    syncConsent: state.syncConsent,
    sync: state.sync,
    dbConnectionState: getConnectionState(state),
    browserSyncConfig: getBrowserSyncConfig(state)
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onSync: (syncObject) => {
      dispatch(setSync(syncObject))
    },
    optOutSync: () => {
      dispatch(optOutSync())
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SyncReminderBanner)
