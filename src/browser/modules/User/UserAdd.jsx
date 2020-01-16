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
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withBus } from 'react-suber'
import uuid from 'uuid'
import { map } from 'lodash-es'

import { executeCommand } from 'shared/modules/commands/commandsDuck'
import { canAssignRolesToUser } from 'shared/modules/features/featuresDuck'

import bolt from 'services/bolt/bolt'
import {
  listRolesQuery,
  createDatabaseUser,
  addRoleToUser
} from 'shared/modules/cypher/boltUserHelper'
import { CYPHER_REQUEST } from 'shared/modules/cypher/cypherDuck'

import RolesSelector from './RolesSelector'
import FrameTemplate from 'browser/modules/Frame/FrameTemplate'
import FrameAside from 'browser/modules/Frame/FrameAside'
import FrameError from 'browser/modules/Frame/FrameError'
import FrameSuccess from 'browser/modules/Frame/FrameSuccess'

import { CloseIcon } from 'browser-components/icons/Icons'
import { FormButton, StyledLink } from 'browser-components/buttons'
import {
  StyledForm,
  StyledFormElement,
  StyledFormElementWrapper,
  StyledLabel
} from 'browser-components/Form'
import { StyledInput, StyleRolesContainer } from './styled'
import { NEO4J_BROWSER_USER_ACTION_QUERY } from 'services/bolt/txMetadata'
import { driverDatabaseSelection } from 'shared/modules/features/versionedFeatures'
import { isEnterprise } from 'shared/modules/dbMeta/dbMetaDuck'
import { EnterpriseOnlyFrame } from 'browser-components/EditionView'

export class UserAdd extends Component {
  constructor(props) {
    super(props)
    this.state = {
      availableRoles: this.props.availableRoles || [],
      roles: this.props.roles || [],
      username: '',
      password: '',
      confirmPassword: '',
      forcePasswordChange: '',
      errors: null,
      success: null,
      isLoading: false
    }

    this.getRoles()
  }

  extractUserNameAndRolesFromBolt(result) {
    const tableArray = bolt.recordsToTableArray(result.records)
    tableArray.shift()
    return tableArray
  }

  removeRole(role) {
    const roles = this.state.roles.slice()
    roles.splice(this.state.roles.indexOf(role), 1)
    return roles
  }

  listRoles() {
    return (
      !!this.state.roles.length && (
        <StyleRolesContainer className="roles-inline">
          {this.state.roles.map((role, i) => {
            return (
              <FormButton
                key={i}
                label={role}
                icon={<CloseIcon />}
                buttonType="tag"
                onClick={() => {
                  this.setState({ roles: this.removeRole(role) })
                }}
              />
            )
          })}
        </StyleRolesContainer>
      )
    )
  }

  addRoles() {
    const errors = []
    this.state.roles.forEach(role => {
      this.props.bus &&
        this.props.bus.self(
          CYPHER_REQUEST,
          {
            query: addRoleToUser(
              this.state.username,
              role,
              Boolean(this.props.useSystemDb)
            ),
            params: {
              username: this.state.username,
              role
            },
            queryType: NEO4J_BROWSER_USER_ACTION_QUERY,
            useDb: this.props.useSystemDb
          },
          response => {
            if (!response.success) {
              return errors.push(response.error)
            }
          }
        )
    })
    if (errors.length > 0) {
      return this.setState({ errors: errors, isLoading: false })
    }
    return this.setState({
      success: `User '${this.state.username}' created`,
      username: '',
      password: '',
      confirmPassword: '',
      roles: [],
      forcePasswordChange: '',
      isLoading: false
    })
  }

  getRoles() {
    this.props.bus &&
      this.props.bus.self(
        CYPHER_REQUEST,
        {
          query: listRolesQuery(Boolean(this.props.useSystemDb)),
          queryType: NEO4J_BROWSER_USER_ACTION_QUERY,
          useDb: this.props.useSystemDb
        },
        response => {
          if (!response.success) {
            const error =
              response.error && response.error.message
                ? response.error.message
                : 'Unknown error'
            return this.setState({
              errors: ['Unable to get roles list', error]
            })
          }
          return this.setState({
            availableRoles: map(response.result.records, record =>
              record.get('role')
            )
          })
        }
      )
  }

  submit() {
    this.setState({ isLoading: true, success: null, errors: null })
    const errors = []
    if (!this.state.username) errors.push('Missing username')
    if (!this.state.password) errors.push('Missing password')
    if (!(this.state.password === this.state.confirmPassword)) {
      errors.push('Passwords are not the same')
    }
    if (errors.length !== 0) {
      return this.setState({ errors: errors })
    } else {
      this.setState({ errors: null })
      return this.createUser()
    }
  }

  createUser() {
    this.props.bus &&
      this.props.bus.self(
        CYPHER_REQUEST,
        {
          query: createDatabaseUser(
            this.state,
            Boolean(this.props.useSystemDb)
          ),
          params: {
            username: this.state.username,
            password: this.state.password
          },
          queryType: NEO4J_BROWSER_USER_ACTION_QUERY,
          useDb: this.props.useSystemDb
        },
        response => {
          if (!response.success) {
            const error =
              response.error && response.error.message
                ? response.error.message
                : 'Unknown error'
            return this.setState({
              errors: ['Unable to create user', error],
              isLoading: false
            })
          }
          return this.addRoles()
        }
      )
  }

  updateUsername(event) {
    return this.setState({ username: event.target.value })
  }

  updatePassword(event) {
    return this.setState({ password: event.target.value })
  }

  confirmUpdatePassword(event) {
    return this.setState({ confirmPassword: event.target.value })
  }

  updateForcePasswordChange() {
    return this.setState({
      forcePasswordChange: !this.state.forcePasswordChange
    })
  }

  availableRoles() {
    return this.state.availableRoles.filter(
      role => this.state.roles.indexOf(role) < 0
    )
  }

  openListUsersFrame() {
    const action = executeCommand(':server user list')
    this.props.bus.send(action.type, action)
  }

  render() {
    const { isLoading } = this.props
    let aside
    let frameContents

    const listOfAvailableRoles = rolesSelectorId =>
      this.state.availableRoles ? (
        <RolesSelector
          roles={this.availableRoles()}
          className="roles"
          name={rolesSelectorId}
          id={rolesSelectorId}
          onChange={event => {
            this.setState({
              roles: this.state.roles.concat([event.target.value])
            })
          }}
        />
      ) : (
        '-'
      )

    let errors = this.state.errors ? this.state.errors.join(', ') : null
    const formId = uuid()
    const usernameId = `username-${formId}`
    const passwordId = `password-${formId}`
    const passwordConfirmId = `password-confirm-${formId}`
    const rolesSelectorId = `roles-selector-${formId}`

    if (!this.props.isEnterpriseEdition) {
      errors = null
      aside = (
        <FrameAside
          title="Frame unavailable"
          subtitle="What edition are you running?"
        />
      )
      frameContents = <EnterpriseOnlyFrame command={this.props.frame.cmd} />
    } else {
      aside = (
        <FrameAside
          title="Add user"
          subtitle="Add a user to the current database"
        />
      )
      frameContents = (
        <StyledForm id={`user-add-${formId}`}>
          <StyledFormElement>
            <StyledLabel htmlFor={usernameId}>Username</StyledLabel>
            <StyledInput
              className="username"
              name={usernameId}
              id={usernameId}
              value={this.state.username}
              onChange={this.updateUsername.bind(this)}
              disabled={isLoading}
            />
          </StyledFormElement>

          <StyledFormElementWrapper>
            <StyledFormElement>
              <StyledLabel htmlFor={passwordId}>Password</StyledLabel>
              <StyledInput
                type="password"
                className="password"
                name={passwordId}
                id={passwordId}
                value={this.state.password}
                onChange={this.updatePassword.bind(this)}
                disabled={isLoading}
              />
            </StyledFormElement>
            <StyledFormElement>
              <StyledLabel htmlFor={passwordConfirmId}>
                Confirm password
              </StyledLabel>
              <StyledInput
                type="password"
                className="password-confirm"
                name={passwordConfirmId}
                id={passwordConfirmId}
                value={this.state.confirmPassword}
                onChange={this.confirmUpdatePassword.bind(this)}
                disabled={isLoading}
              />
            </StyledFormElement>
          </StyledFormElementWrapper>

          <StyledFormElement>
            <StyledLabel htmlFor={rolesSelectorId}>Roles</StyledLabel>
            {listOfAvailableRoles(rolesSelectorId)}
            {this.listRoles()}
          </StyledFormElement>

          <StyledFormElement>
            <StyledLabel>
              <StyledInput
                onChange={this.updateForcePasswordChange.bind(this)}
                checked={this.state.forcePasswordChange}
                disabled={isLoading}
                type="checkbox"
              />
              Force password change
            </StyledLabel>
          </StyledFormElement>

          <StyledFormElement>
            <FormButton
              onClick={this.submit.bind(this)}
              label="Add User"
              disabled={isLoading}
            />
          </StyledFormElement>

          <StyledLink onClick={this.openListUsersFrame.bind(this)}>
            See user list
          </StyledLink>
        </StyledForm>
      )
    }

    const getStatusBar = () => {
      if (errors) return <FrameError message={errors} code="Error" />
      if (this.state.success) {
        return <FrameSuccess message={this.state.success} />
      }
      return null
    }

    return (
      <FrameTemplate
        header={this.props.frame}
        aside={aside}
        contents={frameContents}
        statusbar={getStatusBar()}
      />
    )
  }
}

const mapStateToProps = state => {
  const { database } = driverDatabaseSelection(state, 'system') || {}
  const isEnterpriseEdition = isEnterprise(state)

  return {
    canAssignRolesToUser: canAssignRolesToUser(state),
    useSystemDb: database,
    isEnterpriseEdition
  }
}

export default withBus(
  connect(
    mapStateToProps,
    null
  )(UserAdd)
)
