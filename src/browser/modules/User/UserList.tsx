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
import { map } from 'lodash-es'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withBus } from 'react-suber'
import uuid from 'uuid'

import FrameAside from '../Frame/FrameAside'
import FrameBodyTemplate from '../Frame/FrameBodyTemplate'
import UserInformation from './UserInformation'
import { StyledButtonContainer } from './styled'
import { StyledTable, StyledTh } from 'browser-components/DataTables'
import { EnterpriseOnlyFrame } from 'browser-components/EditionView'
import { StyledLink } from 'browser-components/buttons'
import bolt from 'services/bolt/bolt'
import { NEO4J_BROWSER_USER_ACTION_QUERY } from 'services/bolt/txMetadata'
import {
  commandSources,
  executeCommand
} from 'shared/modules/commands/commandsDuck'
import { isConnectedAuraHost } from 'shared/modules/connections/connectionsDuck'
import { forceFetch } from 'shared/modules/currentUser/currentUserDuck'
import {
  listRolesQuery,
  listUsersQuery
} from 'shared/modules/cypher/boltUserHelper'
import { ROUTED_CYPHER_WRITE_REQUEST } from 'shared/modules/cypher/cypherDuck'
import { isEnterprise } from 'shared/modules/dbMeta/dbMetaDuck'
import { driverDatabaseSelection } from 'shared/modules/features/versionedFeatures'

type UserListState = any

export class UserList extends Component<any, UserListState> {
  constructor(props: {}) {
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
  componentDidUpdate(prevProps: any) {
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

  extractUserNameAndRolesFromBolt(result: any) {
    const tableArray = bolt.recordsToTableArray(result.records)
    tableArray.shift()
    return tableArray
  }

  recordToUserObject = (record: any) => {
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
      ROUTED_CYPHER_WRITE_REQUEST,
      {
        query: listUsersQuery(Boolean(this.props.useSystemDb)),
        queryType: NEO4J_BROWSER_USER_ACTION_QUERY,
        useDb: this.props.useSystemDb
      },
      (response: any) => {
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
      ROUTED_CYPHER_WRITE_REQUEST,
      {
        query: listRolesQuery(Boolean(this.props.useSystemDb)),
        queryType: NEO4J_BROWSER_USER_ACTION_QUERY,
        useDb: this.props.useSystemDb
      },
      (response: any) => {
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

  makeTable(data: any) {
    const tableHeaderValues: any = {
      username: 'Username',
      roles: 'Add Role',
      'current-roles': 'Current Roles(s)',
      status: 'Status',
      'status-action': 'Action',
      'password-change': 'Password Change',
      delete: 'Delete'
    }

    const items = data.map((row: any) => {
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
    const action = executeCommand(':server user add', {
      source: commandSources.button
    })
    this.props.bus.send(action.type, action)
  }

  render() {
    let aside = null
    let frameContents
    if (this.props.isAura) {
      aside = (
        <FrameAside
          title="Frame unavailable"
          subtitle="Frame not currently available on aura."
        />
      )
      frameContents = (
        <div>
          <p>
            User management is currently only available through cypher commands
            on Neo4j Aura Enterprise.
          </p>
          <p>
            Read more on user and role management with cypher on{' '}
            <a
              href="https://neo4j.com/docs/cypher-manual/current/administration/security/users-and-roles"
              target="_blank"
              rel="noreferrer"
            >
              the Neo4j Cypher docs.
            </a>
          </p>
        </div>
      )
    } else if (!this.props.isEnterpriseEdition) {
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
      <FrameBodyTemplate
        isCollapsed={this.props.isCollapsed}
        isFullscreen={this.props.isFullscreen}
        contents={frameContents}
        aside={aside}
      />
    )
  }
}
const mapStateToProps = (state: any) => {
  const { database } = driverDatabaseSelection(state, 'system') || {}
  const isEnterpriseEdition = isEnterprise(state)
  const isAura = isConnectedAuraHost(state)

  return {
    useSystemDb: database,
    isEnterpriseEdition,
    isAura
  }
}

export default withBus(connect(mapStateToProps, null)(UserList))
