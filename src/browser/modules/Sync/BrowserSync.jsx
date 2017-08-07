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
import TimeAgo from 'react-timeago'

import { setSync, clearSync, clearSyncAndLocal, consentSync, authorizedAs } from 'shared/modules/sync/syncDuck'
import { signOut } from 'services/browserSyncService'
import { setContent as setEditorContent } from 'shared/modules/editor/editorDuck'
import { getBrowserSyncConfig } from 'shared/modules/settings/settingsDuck'
import {Drawer, DrawerBody, DrawerHeader, DrawerSection, DrawerSubHeader, DrawerSectionBody, DrawerToppedHeader} from 'browser-components/drawer'
import { FormButton, SyncSignInButton } from 'browser-components/buttons'
import { BinIcon } from 'browser-components/icons/Icons'
import {ConsentCheckBox, AlertBox, ClearLocalConfirmationBox, StyledSyncLink, SmallHeaderText} from './styled'
import BrowserSyncAuthWindow from './BrowserSyncAuthWindow'
import SyncSignInManager from 'shared/modules/sync/SyncSignInManager'

export class BrowserSync extends Component {
  constructor (props) {
    super(props)

    this.state = {
      authData: props.authData,
      error: null,
      serviceAuthenticated: !!props.authData,
      status: props.authData ? 'UP' : 'PENDING',
      userConsented: props.syncConsent,
      showConsentAlert: false,
      clearLocalRequested: false
    }
  }

  componentWillMount () {
    this.syncManager = new SyncSignInManager({
      dbConfig: this.props.browserSyncConfig.firebaseConfig,
      serviceReadyCallback: (status) => this.setState({status}),
      onSyncCallback: this.props.onSync
    })
  }
  logIn () {
    if (this.state.userConsented === true) {
      const { onSignIn } = this.props
      const signInCallback = (data) => onSignIn(data.profile)
      BrowserSyncAuthWindow(this.props.browserSyncConfig.authWindowUrl, (data, error) => {
        this.syncManager.authCallBack.bind(this.syncManager)(data, error, signInCallback)
      })
    } else {
      this.setState({showConsentAlert: true})
    }
  }
  signOutAndClearLocalStorage () {
    if (this.state.clearLocalRequested) {
      this.setState({clearLocalRequested: false, authData: null, serviceAuthenticated: false, userConsented: false})
      this.props.onSignOutAndClear()
    } else {
      this.setState({clearLocalRequested: true})
    }
  }
  signOutFromSync () {
    this.setState({authData: null, serviceAuthenticated: false})
    this.props.onSignOut()
  }
  render () {
    if (this.state.status === 'PENDING') {
      return <Drawer id='sync-drawer'><DrawerHeader>Connecting sync service... </DrawerHeader></Drawer>
    } else if (this.state.status === 'DOWN') {
      return <Drawer id='sync-drawer'><DrawerHeader>Sync service is down</DrawerHeader></Drawer>
    }

    let offlineContent = null
    let consentAlertContent = null
    let onlineContent = null
    let clearLocalDataContent = null
    let headerContent = null

    const serviceAuthenticated = !!this.props.authData
    if (serviceAuthenticated) {
      headerContent =
        <DrawerToppedHeader>
          {this.props.authData.profile.name}<br />
          <SmallHeaderText>Connected</SmallHeaderText><br />
          <SmallHeaderText>
            Synced <TimeAgo date={new Date(this.props.lastSyncedAt)} minPeriod='5' />
          </SmallHeaderText>
        </DrawerToppedHeader>
    } else {
      headerContent = <DrawerHeader>Neo4j Browser Sync</DrawerHeader>
    }

    if (this.state.clearLocalRequested === true) {
      clearLocalDataContent = <ClearLocalConfirmationBox onClick={() => { this.setState({clearLocalRequested: false}) }} />
    } else {
      clearLocalDataContent = 'This will reset your local storage, clearing favorite scripts, grass, command history and settings.'
    }

    if (this.state.showConsentAlert) {
      consentAlertContent = <AlertBox onClick={() => { this.setState({showConsentAlert: false}) }} />
    }

    if (serviceAuthenticated === true) {
      onlineContent = (
        <DrawerBody>
          <DrawerSection>
            <DrawerSubHeader>Manage local data</DrawerSubHeader>
            <DrawerSectionBody>
              <DrawerSection>{clearLocalDataContent}</DrawerSection>
              <FormButton label={this.state.clearLocalRequested ? 'Sign out + clear' : 'Clear local data'} onClick={() => this.signOutAndClearLocalStorage()}
                icon={<BinIcon suppressIconStyles='true' />} buttonType='drawer' />
              <p>&nbsp;</p>
              <FormButton label='Sign Out' onClick={() => this.signOutFromSync()}
                buttonType='drawer' />
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
              <DrawerSection>
                Neo4j Browser Sync is a companion cloud service for Neo4j Browser. Connect through a simple social
                sign-in to get started. <StyledSyncLink onClick={() => this.props.onSyncHelpClick()}>About Neo4j Browser Sync</StyledSyncLink>
              </DrawerSection>
              <DrawerSection>
                <ConsentCheckBox checked={this.state.userConsented === true} onChange={(e) => {
                  this.setState({
                    userConsented: e.target.checked,
                    showConsentAlert: this.state.showConsentAlert && !e.target.checked
                  })
                  this.props.onConsentSyncChanged(e.target.checked)
                }} />
                {consentAlertContent}
              </DrawerSection>
              <DrawerSection>
                <SyncSignInButton onClick={this.logIn.bind(this)}>Sign In / Register</SyncSignInButton>
              </DrawerSection>
            </DrawerSectionBody>
          </DrawerSection>
          <DrawerSection>
            <DrawerSubHeader>Manage local data</DrawerSubHeader>
            <DrawerSectionBody>
              <DrawerSection>{clearLocalDataContent}</DrawerSection>
              <FormButton label='Clear local data' onClick={this.signOutAndClearLocalStorage.bind(this)}
                icon={<BinIcon suppressIconStyles='true' />} buttonType='drawer' />
            </DrawerSectionBody>
          </DrawerSection>
        </DrawerBody>
      )
    }

    return (
      <Drawer id='sync-drawer'>
        {headerContent}
        {offlineContent}
        {onlineContent}
      </Drawer>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    lastSyncedAt: state.sync ? state.sync.lastSyncedAt : null,
    authData: state.sync ? state.sync.authData : null,
    browserSyncConfig: getBrowserSyncConfig(state),
    syncConsent: state.syncConsent.consented
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onSignIn: (data) => {
      const action = authorizedAs(data)
      ownProps.bus.send(action.type, action)
    },
    onSync: (syncObject) => {
      dispatch(setSync(syncObject))
    },
    onSyncHelpClick: (play) => {
      const action = setEditorContent(':play neo4j sync')
      ownProps.bus.send(action.type, action)
    },
    onSignOutAndClear: () => {
      signOut()
      const action = clearSyncAndLocal()
      ownProps.bus.send(action.type, action)
    },
    onSignOut: () => {
      signOut()
      const action = clearSync()
      ownProps.bus.send(action.type, action)
    },
    onConsentSyncChanged: (consent) => {
      dispatch(consentSync(consent))
    }
  }
}
export default withBus(connect(mapStateToProps, mapDispatchToProps)(BrowserSync))
