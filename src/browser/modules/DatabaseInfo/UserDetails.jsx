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
import { executeCommand } from 'shared/modules/commands/commandsDuck'

import Render from 'browser-components/Render'
import {
  DrawerSubHeader,
  DrawerSection,
  DrawerSectionBody
} from 'browser-components/drawer'
import { StyledTable, StyledKey, StyledValue, Link } from './styled'

export class UserDetails extends Component {
  constructor (props) {
    super(props)
    this.state = {
      userDetails: props.userDetails || {}
    }
  }
  fetchUserData () {
    this.props.bus.self(
      CYPHER_REQUEST,
      { query: 'CALL dbms.security.showCurrentUser()' },
      response => {
        if (!response.success) return
        const result = response.result
        const keys = result.records[0].keys
        this.setState({
          userDetails: {
            username: keys.includes('username')
              ? result.records[0].get('username')
              : '-',
            roles: keys.includes('roles')
              ? result.records[0].get('roles')
              : ['admin']
          }
        })
      }
    )
  }
  componentWillMount (props) {
    this.fetchUserData()
  }
  componentWillReceiveProps (props) {
    this.fetchUserData()
  }
  render () {
    const userDetails = this.state.userDetails
    if (userDetails.username) {
      const mappedRoles =
        userDetails.roles.length > 0 ? userDetails.roles.join(', ') : '-'
      const hasAdminRole = userDetails.roles
        .map(role => role.toLowerCase())
        .includes('admin')
      return (
        <DrawerSection className='user-details'>
          <DrawerSubHeader>Connected as</DrawerSubHeader>
          <DrawerSectionBody>
            <StyledTable>
              <tbody>
                <tr>
                  <StyledKey>Username:</StyledKey>
                  <StyledValue>{userDetails.username}</StyledValue>
                </tr>
                <tr>
                  <StyledKey>Roles:</StyledKey>
                  <StyledValue>{mappedRoles}</StyledValue>
                </tr>
                <Render if={hasAdminRole}>
                  <tr>
                    <StyledKey className='user-list-button'>Admin:</StyledKey>
                    <Link
                      onClick={() => this.props.onItemClick(':server user add')}
                    >
                      :server user add
                    </Link>
                  </tr>
                </Render>
              </tbody>
            </StyledTable>
          </DrawerSectionBody>
        </DrawerSection>
      )
    } else {
      return null
    }
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onItemClick: cmd => {
      const action = executeCommand(cmd)
      ownProps.bus.send(action.type, action)
    }
  }
}

export default withBus(connect(null, mapDispatchToProps)(UserDetails))
