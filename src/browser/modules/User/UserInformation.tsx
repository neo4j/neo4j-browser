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
import { useDispatch, useSelector } from 'react-redux'
import { v4 as uuid } from 'uuid'
import { Icons } from 'browser/components/icons'

import RolesSelector from './RolesSelector'
import {
  StyleRolesContainer,
  StyledButtonContainer,
  StyledUserTd
} from './styled'
import { StyledBodyTr } from 'browser-components/DataTables'
import { FormButton } from 'browser-components/buttons'
import { NEO4J_BROWSER_USER_ACTION_QUERY } from 'services/bolt/txMetadata'
import {
  activateUser,
  addRoleToUser,
  deleteUser,
  removeRoleFromUser,
  suspendUser
} from 'shared/modules/cypher/boltUserHelper'
import { CYPHER_REQUEST } from 'shared/modules/cypher/cypherDuck'
import { driverDatabaseSelection } from 'shared/modules/features/versionedFeatures'

interface UserInformationProps {
  user: {
    username: string
    roles: string[]
    active: boolean
    passwordChangeRequired: boolean
  }
  availableRoles: string[]
  refresh: () => void
}

export function UserInformation({ user, availableRoles = [], refresh }: UserInformationProps) {
  const dispatch = useDispatch()
  const useSystemDb = useSelector((state: any) => {
    const { database } = driverDatabaseSelection(state, 'system') || {}
    return database
  })

  const dispatchCypherRequest = (query: string, params = {}) => {
    dispatch({
      type: CYPHER_REQUEST,
      query,
      params,
      queryType: NEO4J_BROWSER_USER_ACTION_QUERY,
      useDb: useSystemDb
    })
    refresh()
  }

  const onRemoveClick = () => {
    dispatchCypherRequest(
      deleteUser(user.username, Boolean(useSystemDb)),
      { username: user.username }
    )
  }

  const onSuspendUser = () => {
    dispatchCypherRequest(
      suspendUser(user.username, Boolean(useSystemDb)),
      { username: user.username }
    )
  }

  const onActivateUser = () => {
    dispatchCypherRequest(
      activateUser(user.username, Boolean(useSystemDb)),
      { username: user.username }
    )
  }

  const onRoleSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    dispatchCypherRequest(
      addRoleToUser(user.username, event.target.value, Boolean(useSystemDb)),
      { username: user.username, role: event.target.value }
    )
  }

  const onRemoveRole = (role: string) => {
    dispatchCypherRequest(
      removeRoleFromUser(role, user.username, Boolean(useSystemDb)),
      { username: user.username, role }
    )
  }

  const status = !user.active ? 'Suspended' : 'Active'
  const passwordChange = user.passwordChangeRequired ? 'Required' : '-'
  const availableRolesList = availableRoles.filter(role => !user.roles.includes(role))

  return (
    <StyledBodyTr className="user-info">
      <StyledUserTd className="username">
        <StyledButtonContainer>{user.username}</StyledButtonContainer>
      </StyledUserTd>
      <StyledUserTd className="roles">
        <RolesSelector
          id={`roles-selector-${uuid()}`}
          roles={availableRolesList}
          onChange={onRoleSelect}
        />
      </StyledUserTd>
      <StyledUserTd className="current-roles">
        {user.roles.length > 0 && (
          <StyleRolesContainer>
            {user.roles.map(role => (
              <FormButton
                key={uuid()}
                label={role}
                icon={<Icons.Close className="icon icon-sm" />}
                buttonType="tag"
                onClick={() => onRemoveRole(role)}
              />
            ))}
          </StyleRolesContainer>
        )}
      </StyledUserTd>
      <StyledUserTd className="status">
        <StyledButtonContainer className={`status-indicator status-${status.toLowerCase()}`}>
          {status}
        </StyledButtonContainer>
      </StyledUserTd>
      <StyledUserTd className="status-action">
        <FormButton
          label={user.active ? 'Suspend' : 'Activate'}
          onClick={user.active ? onSuspendUser : onActivateUser}
        />
      </StyledUserTd>
      <StyledUserTd className="password-change">
        <StyledButtonContainer>{passwordChange}</StyledButtonContainer>
      </StyledUserTd>
      <StyledUserTd className="delete">
        <FormButton
          className="delete"
          label="Remove"
          buttonType="destructive"
          onClick={onRemoveClick}
        />
      </StyledUserTd>
    </StyledBodyTr>
  )
}

export default UserInformation
