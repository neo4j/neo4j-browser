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

import { executeCommand } from 'shared/modules/commands/commandsDuck'
import React, { Component } from 'react'
import uuid from 'uuid'
import { withBus } from 'react-suber'
import {
  listUsersQuery,
  listRolesQuery
} from 'shared/modules/cypher/boltUserHelper'
import UserInformation from './UserInformation'
import bolt from 'services/bolt/bolt'
import { CYPHER_REQUEST } from 'shared/modules/cypher/cypherDuck'
import { StyledLink } from 'browser-components/buttons'
import { StyledTable, StyledTh } from 'browser-components/DataTables'
import { StyledButtonContainer } from './styled'

import FrameTemplate from '../Stream/FrameTemplate'
import { forceFetch } from 'shared/modules/currentUser/currentUserDuck'

export class UserList extends Component {
  constructor (props) {
    super(props)
    this.state = {
      userList: this.props.users || [],
      listRoles: this.props.roles || []
    }
  }
  extractUserNameAndRolesFromBolt (result) {
    let tableArray = bolt.recordsToTableArray(result.records)
    tableArray.shift()
    return tableArray
  }
  getUserList () {
    this.props.bus.self(
      CYPHER_REQUEST,
      { query: listUsersQuery() },
      response => {
        if (response.success) {
          this.setState({
            userList: this.extractUserNameAndRolesFromBolt(response.result)
          })
          this.props.bus.send(forceFetch().type, forceFetch())
        }
      }
    )
  }
  getRoles () {
    this.props.bus.self(
      CYPHER_REQUEST,
      { query: listRolesQuery() },
      response => {
        const flatten = arr =>
          arr.reduce((a, b) => a.concat(Array.isArray(b) ? flatten(b) : b), [])
        if (response.success) {
          this.setState({
            listRoles: flatten(
              this.extractUserNameAndRolesFromBolt(response.result)
            )
          })
        }
      }
    )
  }
  makeTable (data) {
    const items = data.map(row => {
      return (
        <UserInformation
          className='user-information'
          key={uuid.v4()}
          username={row[0]}
          roles={row[1]}
          status={row[2]}
          refresh={this.getUserList.bind(this)}
          availableRoles={this.state.listRoles}
        />
      )
    })
    const tableHeaders = [
      'Username',
      'Add Role',
      'Current Roles(s)',
      'Status',
      'Password Change',
      'Delete'
    ].map((heading, i) => {
      return <StyledTh key={i}>{heading}</StyledTh>
    })
    return (
      <StyledTable>
        <thead>
          <tr>{tableHeaders}</tr>
        </thead>
        <tbody>
          {items}
          <tr>
            <td>
              <StyledButtonContainer>
                <StyledLink onClick={this.openAddNewUserFrame.bind(this)}>
                  Add new user
                </StyledLink>
              </StyledButtonContainer>
            </td>
          </tr>
        </tbody>
      </StyledTable>
    )
  }

  openAddNewUserFrame () {
    const action = executeCommand(':server user add')
    this.props.bus.send(action.type, action)
  }

  componentWillMount () {
    this.getUserList()
    this.getRoles()
  }
  render () {
    const renderedListOfUsers = this.state.userList
      ? this.makeTable(this.state.userList)
      : 'No users'
    const frameContents = (
      <div className='db-list-users'>{renderedListOfUsers}</div>
    )
    return <FrameTemplate header={this.props.frame} contents={frameContents} />
  }
}

export default withBus(UserList)
