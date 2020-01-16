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

import { Component } from 'react'
import { connect } from 'react-redux'

import {
  setSyncData,
  setSyncMetadata,
  authorizedAs,
  updateServiceStatus,
  updateUserAuthStatus,
  resetSyncMetadata,
  setSyncAuthData,
  clearSync,
  SIGNED_IN,
  SIGNED_OUT
} from 'shared/modules/sync/syncDuck'
import { getBrowserSyncConfig } from 'shared/modules/settings/settingsDuck'
import { BrowserSyncAuthIframe } from './BrowserSyncAuthIframes'
import { deepEquals } from 'services/utils'

export function hasAuthData(props) {
  return props.authData && props.authData.data_token
}

export class BrowserSyncInit extends Component {
  constructor(props) {
    super()
    this.state = {
      pendingSignIn: false
    }
  }

  shouldComponentUpdate(props) {
    return !deepEquals(this.props, props)
  }

  componentDidUpdate() {
    // We only connect when props update and not on CDM because
    // tokens should never be in state when this component first loads

    // Sign in one time only
    if (this.state.pendingSignIn) return

    if (hasAuthData(this.props) && this.props.authStatus !== SIGNED_IN) {
      this.setState({ pendingSignIn: true }, () => {
        this.importSyncManager().then(syncManager => {
          syncManager.authenticateWithDataAndBind(
            this.props.authData,
            data => {
              this.setAuthStatus(SIGNED_IN)
              this.props.onSignIn(data)
              this.setState({ pendingSignIn: false })
            },
            () => {
              this.setAuthStatus(SIGNED_OUT)
              this.props.resetSyncMetadata()
              this.setState({ pendingSignIn: false })
            }
          )
        })
      })
    }
  }

  componentWillUnmount() {
    this.syncManager && this.syncManager.signOut()
    this.props.onSignOut()
  }

  componentDidMount() {
    BrowserSyncAuthIframe(
      this.props.silentAuthIframeUrl,
      this.props.delegationTokenIframeUrl,
      this.props.onTokensReceived
    )
  }

  setAuthStatus(status) {
    this.props.onUserAuthStatusChange(status)
  }

  setServiceStatus(status) {
    this.props.onServiceStatusChange(status)
  }

  importSyncManager = () => {
    if (this.syncManager) return Promise.resolve(this.syncManager)
    return import(
      /* webpackChunkName: "sync-manager" */ 'shared/modules/sync/SyncSignInManager'
    ).then(({ default: SyncSignInManager }) => {
      this.syncManager = new SyncSignInManager({
        dbConfig: this.props.config.firebaseConfig,
        serviceReadyCallback: this.setServiceStatus.bind(this),
        onSyncCallback: this.props.onSync,
        disconnectCallback: () => this.setAuthStatus(SIGNED_OUT)
      })
      return this.syncManager
    })
  }

  render() {
    return null
  }
}

const mapStateToProps = getBrowserSyncConfig

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onSync: syncObject => {
      dispatch(setSyncMetadata(syncObject))
      dispatch(setSyncData(syncObject))
    },
    onSignIn: data => {
      const profileAction = authorizedAs(data.profile)
      dispatch(profileAction)
    },
    onSignOut: () => {
      dispatch(clearSync)
    },
    onServiceStatusChange: status => {
      dispatch(updateServiceStatus(status))
    },
    onUserAuthStatusChange: status => {
      dispatch(updateUserAuthStatus(status))
    },
    resetSyncMetadata: () => {
      dispatch(resetSyncMetadata())
    },
    onTokensReceived: data => {
      if (data) {
        dispatch(setSyncAuthData(data))
      }
    }
  }
}
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BrowserSyncInit)
