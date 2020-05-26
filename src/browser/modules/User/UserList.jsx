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

import { executeCommand } from 'shared/modules/commands/commandsDuck'
import React, { Component } from 'react'
import uuid from 'uuid'
import { withBus } from 'react-suber'
import { map } from 'lodash-es'
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

import FrameTemplate from '../Frame/FrameTemplate'
import { forceFetch } from 'shared/modules/currentUser/currentUserDuck'
import { NEO4J_BROWSER_USER_ACTION_QUERY } from 'services/bolt/txMetadata'
import { driverDatabaseSelection } from 'shared/modules/features/versionedFeatures'
import { connect } from 'react-redux'
import { isEnterprise } from 'shared/modules/dbMeta/dbMetaDuck'
import FrameAside from '../Frame/FrameAside'
import { EnterpriseOnlyFrame } from 'browser-components/EditionView'

export class UserList extends Component {
  constructor(props) {
    super(props)
    this.state = {
      userList: this.props.users || [],
      listRoles: this.props.roles || []
    }
  }

  componentDidMount() {
    if (this.props.isEnterpriseEdition) {
      this.getUserList()
      this.getRoles()
    }
  }
  componentDidUpdate(prevProps) {
    if (
      this.props.frame.ts !== prevProps.frame.ts &&
      this.props.frame.isRerun
    ) {
      if (this.props.isEnterpriseEdition) {
        this.getUserList()
        this.getRoles()
      }
    }
  }

  extractUserNameAndRolesFromBolt(result) {
    const tableArray = bolt.recordsToTableArray(result.records)
    tableArray.shift()
    return tableArray
  }

  recordToUserObject = record => {
    const is40 = Boolean(this.props.useSystemDb)

    if (is40) {
      return {
        username: record.get('user'),
        roles: record.get('roles'),
        active: !record.get('suspended'),
        passwordChangeRequired: record.get('passwordChangeRequired')
      }
    }

    return {
      username: record.get('username'),
      roles: record.get('roles'),
      active: !record.get('flags').includes('is_suspended'),
      passwordChangeRequired: record
        .get('flags')
        .includes('password_change_required')
    }
  }

  getUserList() {
    this.props.bus.self(
      CYPHER_REQUEST,
      {
        query: listUsersQuery(Boolean(this.props.useSystemDb)),
        queryType: NEO4J_BROWSER_USER_ACTION_QUERY,
        useDb: this.props.useSystemDb
      },
      response => {
        if (response.success) {
          this.setState({
            userList: map(response.result.records, this.recordToUserObject)
          })
          this.props.bus.send(forceFetch().type, forceFetch())
        }
      }
    )
  }

  getRoles() {
    this.props.bus.self(
      CYPHER_REQUEST,
      {
        query: listRolesQuery(Boolean(this.props.useSystemDb)),
        queryType: NEO4J_BROWSER_USER_ACTION_QUERY,
        useDb: this.props.useSystemDb
      },
      response => {
        if (response.success) {
          this.setState({
            listRoles: map(response.result.records, record =>
              record.get('role')
            )
          })
        }
      }
    )
  }

  makeTable(data) {
    const tableHeaderValues = {
      username: 'Username',
      roles: 'Add Role',
      'current-roles': 'Current Roles(s)',
      status: 'Status',
      'status-action': 'Action',
      'password-change': 'Password Change',
      delete: 'Delete'
    }

    const items = data.map(row => {
      return (
        <UserInformation
          className="user-information"
          key={uuid.v4()}
          user={row}
          refresh={this.getUserList.bind(this)}
          availableRoles={this.state.listRoles}
        />
      )
    })

    const tableHeaders = Object.keys(tableHeaderValues).map((id, key) => {
      return (
        <StyledTh key={`${id}-${key}`} id={id}>
          {tableHeaderValues[id]}
        </StyledTh>
      )
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

  openAddNewUserFrame() {
    const action = executeCommand(':server user add')
    this.props.bus.send(action.type, action)
  }

  render() {
    let aside = null
    let frameContents
    if (!this.props.isEnterpriseEdition) {
      aside = (
        <FrameAside
          title="Frame unavailable"
          subtitle="What edition are you running?"
        />
      )
      frameContents = <EnterpriseOnlyFrame command={this.props.frame.cmd} />
    } else {
      const renderedListOfUsers = this.state.userList
        ? this.makeTable(this.state.userList)
        : 'No users'
      frameContents = <>{renderedListOfUsers}</>
    }
    return (
      <FrameTemplate
        header={this.props.frame}
        contents={frameContents}
        aside={aside}
      />
    )
  }
}
const mapStateToProps = state => {
  const { database } = driverDatabaseSelection(state, 'system') || {}
  const isEnterpriseEdition = isEnterprise(state)

  return {
    useSystemDb: database,
    isEnterpriseEdition
  }
}

export default withBus(connect(mapStateToProps, null)(UserList))
