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
import {
  getActiveConnectionData,
  getActiveConnection,
  setActiveConnection,
  updateConnection,
  CONNECT
} from 'shared/modules/connections/connectionsDuck'
import { getInitCmd } from 'shared/modules/settings/settingsDuck'
import { executeSystemCommand } from 'shared/modules/commands/commandsDuck'
import { shouldRetainConnectionCredentials } from 'shared/modules/dbMeta/dbMetaDuck'
import { FORCE_CHANGE_PASSWORD } from 'shared/modules/cypher/cypherDuck'
import { changeCurrentUsersPasswordQueryObj } from 'shared/modules/cypher/procedureFactory'
import { generateBoltHost } from 'services/utils'
import { getEncryptionMode } from 'services/bolt/boltHelpers'

import ConnectForm from './ConnectForm'
import ConnectedView from './ConnectedView'
import ChangePasswordForm from './ChangePasswordForm'

export class ConnectionForm extends Component {
  constructor (props) {
    super(props)
    const connection =
      this.props.activeConnectionData || this.props.frame.connectionData
    const isConnected = !!props.activeConnection
    this.state = {
      ...connection,
      isConnected: isConnected,
      passwordChangeNeeded: props.passwordChangeNeeded || false,
      forcePasswordChange: props.forcePasswordChange || false,
      successCallback: props.onSuccess || (() => {}),
      used: isConnected,
      storeCredentials: this.props.storeCredentials
    }
  }
  tryConnect = (password, doneFn) => {
    this.props.error({})
    this.props.bus.self(CONNECT, { ...this.state, password }, res => {
      doneFn(res)
    })
  }
  connect = (doneFn = () => {}) => {
    this.props.error({})
    this.props.bus.self(CONNECT, this.state, res => {
      doneFn()
      if (res.success) {
        this.saveAndStart()
      } else {
        if (res.error.code === 'Neo.ClientError.Security.CredentialsExpired') {
          this.setState({ passwordChangeNeeded: true })
        } else {
          this.props.error(res.error)
        }
      }
    })
  }
  onUsernameChange (event) {
    const username = event.target.value
    this.setState({ username })
    this.props.error({})
  }
  onPasswordChange (event) {
    const password = event.target.value
    this.setState({ password })
    this.props.error({})
  }
  onHostChange (event) {
    const host = event.target.value
    this.setState({
      host: generateBoltHost(host),
      hostInputVal: host
    })
    this.props.error({})
  }
  onChangePasswordChange () {
    this.props.error({})
  }
  onChangePassword ({ newPassword, error }) {
    if (error && error.code) {
      return this.props.error(error)
    }
    if (this.state.password === null) {
      return this.props.error({ message: 'Please set existing password' })
    }
    this.props.error({})
    this.props.bus.self(
      FORCE_CHANGE_PASSWORD,
      {
        host: this.state.host,
        username: this.state.username,
        password: this.props.oldPassword || this.state.password,
        encrypted: getEncryptionMode(this.state),
        ...changeCurrentUsersPasswordQueryObj(newPassword)
      },
      response => {
        if (response.success) {
          return this.setState({ password: newPassword }, () => {
            this.connect()
          })
        }
        this.props.error(response.error)
      }
    )
  }
  saveAndStart () {
    this.setState({ forcePasswordChange: false, used: true })
    this.state.successCallback()
    this.saveCredentials()
    this.props.setActiveConnection(this.state.id)
    this.props.executeInitCmd()
  }
  saveCredentials () {
    this.props.updateConnection({
      id: this.state.id,
      host: this.state.host,
      username: this.state.username,
      password: this.state.password
    })
  }
  componentWillReceiveProps (nextProps) {
    if (nextProps.oldPassword) {
      this.setState({ oldPassword: nextProps.oldPassword })
    }
    if (nextProps.activeConnection && nextProps.activeConnectionData) {
      this.setState({ isConnected: true })
    } else {
      this.setState({ isConnected: false })
    }
  }
  render () {
    let view
    if (
      this.state.forcePasswordChange ||
      (!this.state.isConnected && this.state.passwordChangeNeeded)
    ) {
      view = (
        <ChangePasswordForm
          showExistingPasswordInput={this.props.showExistingPasswordInput}
          onChangePasswordClick={this.onChangePassword.bind(this)}
          onChange={this.onChangePasswordChange.bind(this)}
          tryConnect={this.tryConnect}
        >
          {this.props.children}
        </ChangePasswordForm>
      )
    } else if (this.state.isConnected) {
      view = (
        <ConnectedView
          host={this.state.host}
          username={this.state.username}
          storeCredentials={this.state.storeCredentials}
        />
      )
    } else if (!this.state.isConnected && !this.state.passwordChangeNeeded) {
      view = (
        <ConnectForm
          onConnectClick={this.connect.bind(this)}
          onHostChange={this.onHostChange.bind(this)}
          onUsernameChange={this.onUsernameChange.bind(this)}
          onPasswordChange={this.onPasswordChange.bind(this)}
          host={this.state.hostInputVal || this.state.host}
          username={this.state.username}
          password={this.state.password}
          used={this.state.used}
        />
      )
    }
    return view
  }
}

const mapStateToProps = state => {
  return {
    initCmd: getInitCmd(state),
    activeConnection: getActiveConnection(state),
    activeConnectionData: getActiveConnectionData(state),
    storeCredentials: shouldRetainConnectionCredentials(state)
  }
}

const mapDispatchToProps = dispatch => {
  return {
    updateConnection: connection => {
      dispatch(updateConnection(connection))
    },
    setActiveConnection: id => dispatch(setActiveConnection(id)),
    dispatchInitCmd: initCmd => dispatch(executeSystemCommand(initCmd))
  }
}

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  return {
    activeConnection: stateProps.activeConnection,
    activeConnectionData: stateProps.activeConnectionData,
    storeCredentials: stateProps.storeCredentials,
    ...ownProps,
    ...dispatchProps,
    executeInitCmd: () => {
      dispatchProps.dispatchInitCmd(stateProps.initCmd)
    }
  }
}

export default withBus(
  connect(
    mapStateToProps,
    mapDispatchToProps,
    mergeProps
  )(ConnectionForm)
)
