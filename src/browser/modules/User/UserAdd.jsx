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
import { executeCommand } from 'shared/modules/commands/commandsDuck'
import { Component } from 'preact'
import { withBus } from 'preact-suber'

import bolt from 'services/bolt/bolt'
import { listRolesQuery, createDatabaseUser, addRoleToUser } from 'shared/modules/cypher/boltUserHelper'
import { CYPHER_REQUEST } from 'shared/modules/cypher/cypherDuck'

import RolesSelector from './RolesSelector'
import FrameTemplate from '../Stream/FrameTemplate'
import FrameError from '../Stream/FrameError'
import FrameSuccess from '../Stream/FrameSuccess'

import { CloseIcon } from 'browser-components/icons/Icons'
import { FormButton, StyledLink } from 'browser-components/buttons'
import {StyledTable, StyledBodyTr, StyledTh, StyledTd} from 'browser-components/DataTables'

export class UserAdd extends Component {
  constructor (props) {
    super(props)
    this.state = {
      availableRoles: this.props.availableRoles || [],
      roles: this.props.roles || [],
      username: '',
      password: '',
      confirmPassword: '',
      forcePasswordChange: false,
      errors: null,
      success: null
    }
  }
  componentWillMount () {
    this.getRoles()
  }
  extractUserNameAndRolesFromBolt (result) {
    let tableArray = bolt.recordsToTableArray(result.records)
    tableArray.shift()
    return tableArray
  }
  removeRole (role) {
    const roles = this.state.roles.slice()
    roles.splice(this.state.roles.indexOf(role), 1)
    return roles
  }
  listRoles () {
    return this.state.roles.map((role, i) => {
      return (
        <FormButton key={i} label={role} icon={<CloseIcon />} onClick={() => {
          this.setState({roles: this.removeRole(role)})
        }} />
      )
    })
  }
  addRoles () {
    let errors = []
    this.state.roles.forEach((role) => {
      this.props.bus.self(
        CYPHER_REQUEST,
        {query: addRoleToUser(this.state.username, role)},
        (response) => {
          if (!response.success) {
            return errors.add(response.error)
          }
        }
      )
    })
    if (errors.length > 0) {
      return this.setState({errors: errors})
    }
    return this.setState({success: `${this.state.username} created`})
  }
  getRoles () {
    this.props.bus.self(
      CYPHER_REQUEST,
      {query: listRolesQuery()},
      (response) => {
        if (!response.success) {
          return this.setState({errors: ['Unable to create user', response.error]})
        }
        const flatten = arr => arr.reduce((a, b) => a.concat(Array.isArray(b) ? flatten(b) : b), [])
        return this.setState({availableRoles: flatten(this.extractUserNameAndRolesFromBolt(response.result))})
      })
  }
  submit () {
    this.setState({success: null, errors: null})
    let errors = []
    if (!this.state.username) errors.push('Missing username')
    if (!this.state.password) errors.push('Missing password')
    if (!(this.state.password === this.state.confirmPassword)) errors.push('Passwords are not the same')
    if (errors.length !== 0) {
      return this.setState({errors: errors})
    } else {
      this.setState({errors: null})
      return this.createUser()
    }
  }
  createUser () {
    this.props.bus.self(
      CYPHER_REQUEST,
      {query: createDatabaseUser(this.state)},
      (response) => {
        if (!response.success) {
          return this.setState({errors: ['Unable to create user', response.error]})
        }
        return this.addRoles.bind(this)
      })
  }
  updateUsername (event) {
    return this.setState({username: event.target.value})
  }
  updatePassword (event) {
    return this.setState({password: event.target.value})
  }
  confirmUpdatePassword (event) {
    return this.setState({confirmPassword: event.target.value})
  }
  updateForcePasswordChange (event) {
    return this.setState({forcePasswordChange: !this.state.forcePasswordChange})
  }
  availableRoles () {
    return this.state.availableRoles.filter(role => this.state.roles.indexOf(role) < 0)
  }

  openListUsersFrame () {
    const action = executeCommand(':server user list')
    this.props.bus.send(action.type, action)
  }

  render () {
    const listOfAvailableRoles = (this.state.availableRoles)
      ? (<RolesSelector roles={this.availableRoles()} onChange={(event) => {
        this.setState({roles: this.state.roles.concat([event.target.value])})
      }} />)
      : '-'
    const tableHeaders = ['Username', 'Roles(s)', 'Set Password', 'Confirm Password', 'Force Password Change'].map((heading, i) => {
      return (<StyledTh key={i}>{heading}</StyledTh>)
    })
    const errors = (this.state.errors) ? this.state.errors.join(', ') : null
    const table = (
      <StyledTable>
        <thead>
          <tr>
            {tableHeaders}
          </tr>
        </thead>
        <tbody>
          <StyledBodyTr>
            <StyledTd>
              <input className='username' onChange={this.updateUsername.bind(this)} />
            </StyledTd>
            <StyledTd>
              {listOfAvailableRoles}
              {this.listRoles()}
            </StyledTd>
            <StyledTd>
              <input onChange={this.updatePassword.bind(this)} type='password' />
            </StyledTd>
            <StyledTd>
              <input onChange={this.confirmUpdatePassword.bind(this)} type='password' />
            </StyledTd>
            <StyledTd>
              <input onClick={this.updateForcePasswordChange.bind(this)} type='checkbox' />
            </StyledTd>
          </StyledBodyTr>
          <StyledBodyTr>
            <td>
              <FormButton onClick={this.submit.bind(this)} label='Add User' />
            </td>
          </StyledBodyTr>
        </tbody>
      </StyledTable>
    )

    const frameContents = (
      <div>
        {table}
        <StyledLink onClick={this.openListUsersFrame.bind(this)}>
          See user list
        </StyledLink>
      </div>
    )
    return (
      <FrameTemplate
        header={this.props.frame}
        contents={frameContents}
      >
        <FrameError message={errors} />
        <FrameSuccess message={this.state.success} />
      </FrameTemplate>

    )
  }
}

export default withBus(UserAdd)
