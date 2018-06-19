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
import { CYPHER_REQUEST } from 'shared/modules/cypher/cypherDuck'
import {
  getCurrentUser,
  updateCurrentUser
} from 'shared/modules/currentUser/currentUserDuck'

export class UserInfoComponent extends Component {
  constructor (props) {
    super(props)
    this.state = { user: this.props.info }
  }
  extractUserNameAndRolesFromBolt (r) {
    return {
      username: r.records[0]._fields[0],
      roles: r.records[0]._fields[1]
    }
  }
  componentWillReceiveProps (newProps) {
    this.setState({ user: newProps.info })
  }
  componentWillMount () {
    this.props.bus.self(
      CYPHER_REQUEST,
      'CALL dbms.showCurrentUser',
      response => {
        if (!response.success) return
        const user = this.extractUserNameAndRolesFromBolt(response)
        this.props.updateCurrentUser(user.username, user.roles)
      }
    )
  }
  render () {
    const currentUser = this.state.user
    const result = currentUser == null ? null : JSON.stringify(currentUser)
    return (
      <div id='db-user'>
        <h4>User Information</h4>
        <p>Current user: {result}</p>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    info: getCurrentUser(state)
  }
}

const mapDispatchToProps = dispatch => {
  return {
    updateCurrentUser: (username, roles) => {
      dispatch(updateCurrentUser(username, roles))
    }
  }
}

const UserInfo = withBus(
  connect(mapStateToProps, mapDispatchToProps)(UserInfoComponent)
)
export default UserInfo
