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
import React, { Component } from 'react'
import { connect } from 'react-redux'
import TimeAgo from 'react-timeago'

import { BinIcon } from 'browser-components/icons/LegacyIcons'

import { BrowserSyncSignoutIframe } from './BrowserSyncAuthIframes'
import BrowserSyncAuthWindow from './BrowserSyncAuthWindow'
import {
  AlertBox,
  ClearLocalConfirmationBox,
  ConsentCheckBox,
  SmallHeaderText
} from './styled'
import { FormButton, SyncSignInButton } from 'browser-components/buttons'
import {
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerSection,
  DrawerSectionBody,
  DrawerSubHeader,
  DrawerToppedHeader
} from 'browser-components/drawer/drawer-styled'
import { signOut } from 'services/browserSyncService'
import {
  DISCONNECTED_STATE,
  getConnectionState
} from 'shared/modules/connections/connectionsDuck'
import { shouldAllowOutgoingConnections } from 'shared/modules/dbMeta/dbMetaDuck'
import { getBrowserSyncConfig } from 'shared/modules/settings/settingsDuck'
import {
  DOWN,
  PENDING,
  SIGNED_IN,
  authorizedAs,
  clearSync as clearSyncAction,
  clearSyncAndLocal as clearSyncAndLocalAction,
  consentSync,
  getLastSyncedAt,
  getServiceStatus,
  getUserAuthStatus,
  getUserData,
  setSyncAuthData,
  setSyncData,
  setSyncMetadata
} from 'shared/modules/sync/syncDuck'

type BrowserSyncState = any

export class BrowserSync extends Component<any, BrowserSyncState> {
  constructor(props: any) {
    super(props)

    this.state = {
      error: null,
      userConsented: props.syncConsent,
      showConsentAlert: false,
      clearLocalRequested: false
    }
  }

  logIn() {
    if (this.state.userConsented === true) {
      const { onSignIn } = this.props
      BrowserSyncAuthWindow(
        this.props.browserSyncConfig.authWindowUrl,
        (data: any) => {
          onSignIn(data)
        }
      )
    } else {
      this.setState({ showConsentAlert: true })
    }
  }

  signOutAndClearLocalStorage() {
    if (this.state.clearLocalRequested) {
      this.setState({
        clearLocalRequested: false,
        userConsented: false
      })
      this.props.onSignOutAndClear()
    } else {
      this.setState({ clearLocalRequested: true })
    }
  }

  signOutFromSync() {
    this.props.onSignOut()
  }

  render() {
    if (this.props.serviceStatus === PENDING) {
      return (
        <Drawer id="sync-drawer">
          <DrawerHeader>Connecting sync service... </DrawerHeader>
        </Drawer>
      )
    } else if (this.props.connectionState === DISCONNECTED_STATE) {
      return (
        <Drawer id="sync-drawer">
          <DrawerHeader>No database connection</DrawerHeader>
          <DrawerBody>
            You must first connect to a database to use Browser Sync.
          </DrawerBody>
        </Drawer>
      )
    } else if (!this.props.isAllowed) {
      return (
        <Drawer id="sync-drawer">
          <DrawerHeader>Browser Sync is disabled</DrawerHeader>
          <DrawerBody>
            Browser Sync is disabled due to Neo4j server configuration. Raise
            the issue with your administrator.
          </DrawerBody>
        </Drawer>
      )
    } else if (this.props.serviceStatus === DOWN) {
      return (
        <Drawer id="sync-drawer">
          <DrawerHeader>Sync service is down</DrawerHeader>
        </Drawer>
      )
    }

    let offlineContent = null
    let consentAlertContent = null
    let onlineContent = null
    let clearLocalDataContent = null
    let headerContent = null

    if (this.props.authStatus === SIGNED_IN) {
      headerContent = (
        <DrawerToppedHeader>
          {this.props.userData.name}
          <br />
          <SmallHeaderText>Connected</SmallHeaderText>
          <br />
          <SmallHeaderText>
            Synced{' '}
            <TimeAgo date={new Date(this.props.lastSyncedAt)} minPeriod="5" />
          </SmallHeaderText>
        </DrawerToppedHeader>
      )
    } else {
      headerContent = <DrawerHeader>Neo4j Browser Sync</DrawerHeader>
    }

    if (this.state.clearLocalRequested === true) {
      clearLocalDataContent = (
        <ClearLocalConfirmationBox
          onClick={() => {
            this.setState({ clearLocalRequested: false })
          }}
        />
      )
    } else {
      clearLocalDataContent =
        'This will reset your local storage, clearing favorite scripts, grass, command history and settings.'
    }

    if (this.state.showConsentAlert) {
      consentAlertContent = (
        <AlertBox
          onClick={() => {
            this.setState({ showConsentAlert: false })
          }}
        />
      )
    }

    if (this.props.authStatus === SIGNED_IN) {
      onlineContent = (
        <DrawerBody>
          <DrawerSection>
            <DrawerSubHeader>Manage local data</DrawerSubHeader>
            <DrawerSectionBody>
              <DrawerSection>{clearLocalDataContent}</DrawerSection>
              <FormButton
                label={
                  this.state.clearLocalRequested
                    ? 'Sign out + clear'
                    : 'Clear local data'
                }
                onClick={() => this.signOutAndClearLocalStorage()}
                icon={<BinIcon />}
                buttonType="drawer"
              />
              <p>&nbsp;</p>
              <FormButton
                label="Sign Out"
                onClick={() => this.signOutFromSync()}
                buttonType="drawer"
              />
            </DrawerSectionBody>
          </DrawerSection>
        </DrawerBody>
      )
    } else {
      offlineContent = (
        <DrawerBody>
          <DrawerSection>
            <DrawerSubHeader>Sign In or Register</DrawerSubHeader>
            <DrawerSectionBody>
              Neo4j Browser Sync is a companion service for Neo4j Browser.
              Connect through a simple social sign-in to get started.
              <br />
              <br />
              <ConsentCheckBox
                checked={this.state.userConsented === true}
                onChange={(e: any) => {
                  this.setState({
                    userConsented: e.target.checked,
                    showConsentAlert:
                      this.state.showConsentAlert && !e.target.checked
                  })
                  this.props.onConsentSyncChanged(e.target.checked)
                }}
              />
              {consentAlertContent}
              <SyncSignInButton onClick={this.logIn.bind(this)}>
                Sign In / Register
              </SyncSignInButton>
            </DrawerSectionBody>
          </DrawerSection>
          <DrawerSection>
            <DrawerSubHeader>Manage local data</DrawerSubHeader>
            <DrawerSectionBody>
              {clearLocalDataContent}
              <br />
              <br />
              <FormButton
                data-testid="clearLocalData"
                label="Clear local data"
                onClick={this.signOutAndClearLocalStorage.bind(this)}
                icon={<BinIcon />}
                buttonType="drawer"
              />
            </DrawerSectionBody>
          </DrawerSection>
        </DrawerBody>
      )
    }

    return (
      <Drawer id="sync-drawer">
        {headerContent}
        {offlineContent}
        {onlineContent}
      </Drawer>
    )
  }
}

const mapStateToProps = (state: any) => {
  return {
    lastSyncedAt: getLastSyncedAt(state),
    userData: getUserData(state),
    authStatus: getUserAuthStatus(state),
    serviceStatus: getServiceStatus(state),
    browserSyncConfig: getBrowserSyncConfig(state),
    syncConsent: state.syncConsent.consented,
    connectionState: getConnectionState(state),
    isAllowed: shouldAllowOutgoingConnections(state) !== false
  }
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    onSignIn: (data: any) => {
      const profileAction = authorizedAs(data.profile)
      dispatch(profileAction)
      const authDataAction = setSyncAuthData(data)
      dispatch(authDataAction)
    },
    onSync: (syncObject: any) => {
      dispatch(setSyncMetadata(syncObject))
      dispatch(setSyncData(syncObject))
    },
    sendActionToDispatch: dispatch,
    onConsentSyncChanged: (consent: any) => {
      dispatch(consentSync(consent))
    }
  }
}
const mergeProps = (stateProps: any, dispatchProps: any, ownProps: any) => {
  return {
    ...ownProps,
    ...stateProps,
    ...dispatchProps,
    onSignOut: () => {
      signOut()
      dispatchProps.sendActionToDispatch(clearSyncAction)
      BrowserSyncSignoutIframe(stateProps.browserSyncConfig.logoutUrl)
    },
    onSignOutAndClear: () => {
      signOut()
      dispatchProps.sendActionToDispatch(clearSyncAndLocalAction)
      BrowserSyncSignoutIframe(stateProps.browserSyncConfig.logoutUrl)
    }
  }
}
export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(BrowserSync)
