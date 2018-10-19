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
import {
  SyncDisconnectedBanner,
  SyncSignInBarButton,
  StyledCancelLink,
  StyledSyncReminderSpan,
  StyledSyncReminderButtonContainer
} from './styled'
import {
  CONNECTED_STATE,
  getConnectionState
} from 'shared/modules/connections/connectionsDuck'
import Render from 'browser-components/Render'
import BrowserSyncAuthWindow from '../Sync/BrowserSyncAuthWindow'
import { getBrowserSyncConfig } from 'shared/modules/settings/settingsDuck'
import {
  optOutSync,
  getUserAuthStatus,
  SIGNED_IN,
  setSyncData
} from 'shared/modules/sync/syncDuck'

class SyncReminderBanner extends Component {
  state = {}
  importSyncManager = () => {
    if (this.syncManager) return Promise.resolve(this.syncManager)
    return import(/* webpackChunkName: "sync-manager" */ 'shared/modules/sync/SyncSignInManager').then(
      ({ default: SyncSignInManager }) => {
        this.syncManager = new SyncSignInManager({
          dbConfig: this.props.browserSyncConfig.firebaseConfig,
          serviceReadyCallback: this.serviceReady.bind(this),
          onSyncCallback: this.props.onSync
        })
        return this.syncManager
      }
    )
  }
  serviceReady (status) {
    this.setState({ status })
  }
  logIn () {
    this.importSyncManager().then(syncManager => {
      BrowserSyncAuthWindow(
        this.props.browserSyncConfig.authWindowUrl,
        this.syncManager.authCallBack.bind(this.syncManager)
      )
    })
  }
  render () {
    const {
      dbConnectionState,
      syncConsent,
      optOutSync,
      authStatus
    } = this.props
    const dbConnected = dbConnectionState === CONNECTED_STATE
    const syncConsentGiven =
      syncConsent && syncConsent.consented === true && !syncConsent.optedOut

    const visible =
      dbConnected &&
      syncConsentGiven &&
      authStatus !== SIGNED_IN &&
      this.state.status === 'UP'

    return (
      <Render if={visible}>
        <SyncDisconnectedBanner height='100px'>
          <StyledSyncReminderSpan>
            You are currently not signed into Neo4j Browser Sync. Connect
            through a simple social sign-in to get started.
            <SyncSignInBarButton onClick={this.logIn.bind(this)}>
              Sign In
            </SyncSignInBarButton>
          </StyledSyncReminderSpan>
          <StyledSyncReminderButtonContainer>
            <StyledCancelLink onClick={() => optOutSync()}>X</StyledCancelLink>
          </StyledSyncReminderButtonContainer>
        </SyncDisconnectedBanner>
      </Render>
    )
  }
}

const mapStateToProps = state => {
  return {
    syncConsent: state.syncConsent,
    authStatus: getUserAuthStatus(state),
    dbConnectionState: getConnectionState(state),
    browserSyncConfig: getBrowserSyncConfig(state)
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onSync: syncObject => {
      dispatch(setSyncData(syncObject))
    },
    optOutSync: () => {
      dispatch(optOutSync())
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SyncReminderBanner)
