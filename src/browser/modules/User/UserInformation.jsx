/*
 * Copyright (c) 2002-2019 "Neo4j,"
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
import { v4 } from 'uuid'

import { CYPHER_REQUEST } from 'shared/modules/cypher/cypherDuck'
import { withBus } from 'react-suber'
import {
  deleteUser,
  addRoleToUser,
  removeRoleFromUser,
  activateUser,
  suspendUser
} from 'shared/modules/cypher/boltUserHelper'

import { FormButton } from 'browser-components/buttons'
import { CloseIcon } from 'browser-components/icons/Icons'
import { StyledBodyTr } from 'browser-components/DataTables'
import { StyledUserTd, StyledButtonContainer } from './styled'

import RolesSelector from './RolesSelector'
import { NEO4J_BROWSER_USER_ACTION_QUERY } from 'services/bolt/txMetadata'

export class UserInformation extends Component {
  constructor (props) {
    super(props)
    this.state = {
      edit: false,
      availableRoles: this.props.availableRoles || [],
      roles: this.props.roles || [],
      username: this.props.username
    }
  }
  removeClick (thing) {
    this.props.bus.self(
      CYPHER_REQUEST,
      {
        query: deleteUser(this.state.username),
        queryType: NEO4J_BROWSER_USER_ACTION_QUERY
      },
      this.handleResponse.bind(this)
    )
  }
  suspendUser () {
    this.props.bus.self(
      CYPHER_REQUEST,
      {
        query: suspendUser(this.state.username),
        queryType: NEO4J_BROWSER_USER_ACTION_QUERY
      },
      this.handleResponse.bind(this)
    )
  }
  activateUser () {
    this.props.bus.self(
      CYPHER_REQUEST,
      {
        query: activateUser(this.state.username),
        queryType: NEO4J_BROWSER_USER_ACTION_QUERY
      },
      this.handleResponse.bind(this)
    )
  }
  statusButton (statusList = []) {
    if (statusList.indexOf('is_suspended') !== -1) {
      return (
        <FormButton
          label='Suspend user'
          onClick={this.activateUser.bind(this)}
        />
      )
    } else {
      return (
        <FormButton label='Active user' onClick={this.suspendUser.bind(this)} />
      )
    }
  }
  passwordChange () {
    return '-'
  }
  listRoles () {
    return this.state.roles.map(role => {
      return (
        <FormButton
          key={v4()}
          label={role}
          icon={<CloseIcon />}
          onClick={() => {
            this.props.bus.self(
              CYPHER_REQUEST,
              {
                query: removeRoleFromUser(role, this.state.username),
                queryType: NEO4J_BROWSER_USER_ACTION_QUERY
              },
              this.handleResponse.bind(this)
            )
          }}
        />
      )
    })
  }
  onRoleSelect (event) {
    this.props.bus.self(
      CYPHER_REQUEST,
      {
        query: addRoleToUser(this.state.username, event.target.value),
        queryType: NEO4J_BROWSER_USER_ACTION_QUERY
      },
      this.handleResponse.bind(this)
    )
  }
  handleResponse (response) {
    if (!response.success) return this.setState({ errors: [response.error] })
    return this.props.refresh()
  }
  availableRoles () {
    return this.state.availableRoles.filter(
      role => this.props.roles.indexOf(role) < 0
    )
  }
  render () {
    return (
      <StyledBodyTr className='user-info'>
        <StyledUserTd className='username'>
          <StyledButtonContainer>{this.props.username}</StyledButtonContainer>
        </StyledUserTd>
        <StyledUserTd className='roles'>
          <RolesSelector
            roles={this.availableRoles()}
            onChange={this.onRoleSelect.bind(this)}
          />
        </StyledUserTd>
        <StyledUserTd className='current-roles'>
          <span>{this.listRoles()}</span>
        </StyledUserTd>
        <StyledUserTd className='status'>
          {this.statusButton(this.props.status)}
        </StyledUserTd>
        <StyledUserTd className='password-change'>
          {this.passwordChange()}
        </StyledUserTd>
        <StyledUserTd>
          <FormButton
            className='delete'
            label='Remove'
            onClick={this.removeClick.bind(this)}
          />
        </StyledUserTd>
      </StyledBodyTr>
    )
  }
}

export default withBus(UserInformation)
