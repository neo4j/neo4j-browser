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
import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { v4 as uuidv4 } from 'uuid'

import FrameAside from '../Frame/FrameAside'
import FrameBodyTemplate from '../Frame/FrameBodyTemplate'
import UserInformation from './UserInformation'
import { buttonClasses, tableClasses } from './styled'
import { EnterpriseOnlyFrame } from 'browser-components/EditionView'
import { StyledLink } from 'browser-components/buttons'
import { NEO4J_BROWSER_USER_ACTION_QUERY } from 'services/bolt/txMetadata'
import { commandSources, executeCommand } from 'shared/modules/commands/commandsDuck'
import { isConnectedAuraHost } from 'shared/modules/connections/connectionsDuck'
import { forceFetch } from 'shared/modules/currentUser/currentUserDuck'
import { listRolesQuery, listUsersQuery } from 'shared/modules/cypher/boltUserHelper'
import { ROUTED_CYPHER_WRITE_REQUEST } from 'shared/modules/cypher/cypherDuck'
import { isEnterprise } from 'shared/modules/dbMeta/dbMetaDuck'
import { driverDatabaseSelection } from 'shared/modules/features/versionedFeatures'

interface UserListProps {
  frame: {
    ts: number
    isRerun: boolean
    cmd: string
  }
  isCollapsed: boolean
  isFullscreen: boolean
  users?: any[]
  roles?: string[]
}

export function UserList({ frame, isCollapsed, isFullscreen }: UserListProps) {
  const dispatch = useDispatch()
  const [userList, setUserList] = useState<any[]>([])
  const [listRoles, setListRoles] = useState<string[]>([])

  const { useSystemDb, isEnterpriseEdition, isAura } = useSelector((state: any) => {
    const { database } = driverDatabaseSelection(state, 'system') || {}
    return {
      useSystemDb: database,
      isEnterpriseEdition: isEnterprise(state),
      isAura: isConnectedAuraHost(state)
    }
  })

  const recordToUserObject = (record: any) => {
    const is40 = Boolean(useSystemDb)
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
      passwordChangeRequired: record.get('flags').includes('password_change_required')
    }
  }

  const getUserList = () => {
    dispatch({
      type: ROUTED_CYPHER_WRITE_REQUEST,
      query: listUsersQuery(Boolean(useSystemDb)),
      queryType: NEO4J_BROWSER_USER_ACTION_QUERY,
      useDb: useSystemDb,
      onSuccess: (response: any) => {
        if (response.success) {
          setUserList(map(response.result.records, recordToUserObject))
          dispatch(forceFetch())
        }
      }
    })
  }

  const getRoles = () => {
    dispatch({
      type: ROUTED_CYPHER_WRITE_REQUEST,
      query: listRolesQuery(Boolean(useSystemDb)),
      queryType: NEO4J_BROWSER_USER_ACTION_QUERY,
      useDb: useSystemDb,
      onSuccess: (response: any) => {
        if (response.success) {
          setListRoles(map(response.result.records, record => record.get('role')))
        }
      }
    })
  }

  useEffect(() => {
    if (isEnterpriseEdition) {
      getUserList()
      getRoles()
    }
  }, [isEnterpriseEdition, frame.ts, frame.isRerun])

  const makeTable = (data: any[]) => {
    const tableHeaderValues = {
      username: 'Username',
      roles: 'Add Role',
      'current-roles': 'Current Roles(s)',
      status: 'Status',
      'status-action': 'Action',
      'password-change': 'Password Change',
      delete: 'Delete'
    }

    const items = data.map(row => (
      <UserInformation
        key={uuidv4()}
        user={row}
        refresh={getUserList}
        availableRoles={listRoles}
      />
    ))

    const tableHeaders = Object.entries(tableHeaderValues).map(([id, value]) => (
      <th key={id} id={id} className={tableClasses.th}>
        {value}
      </th>
    ))

    return (
      <table className={tableClasses.table}>
        <thead>
          <tr>
            {tableHeaders}
          </tr>
        </thead>
        <tbody>
          {items}
          <tr>
            <td>
              <div className={buttonClasses.base}>
                <StyledLink onClick={() => dispatch(executeCommand(':server user add', {
                  source: commandSources.button
                }))}>
                  Add new user
                </StyledLink>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    )
  }

  let aside = null
  let frameContents

  if (isAura) {
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
  } else if (!isEnterpriseEdition) {
    aside = (
      <FrameAside
        title="Frame unavailable"
        subtitle="What edition are you running?"
      />
    )
    frameContents = <EnterpriseOnlyFrame command={frame.cmd} />
  } else {
    frameContents = userList ? makeTable(userList) : 'No users'
  }

  return (
    <FrameBodyTemplate
      isCollapsed={isCollapsed}
      isFullscreen={isFullscreen}
      contents={frameContents}
      aside={aside}
    />
  )
}

export default UserList
