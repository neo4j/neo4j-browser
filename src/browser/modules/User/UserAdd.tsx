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

import { CloseIcon } from 'browser-components/icons/LegacyIcons'

import RolesSelector from './RolesSelector'
import { StyleRolesContainer, StyledInput } from './styled'
import { EnterpriseOnlyFrame } from 'browser-components/EditionView'
import {
  StyledForm,
  StyledFormElement,
  StyledFormElementWrapper,
  StyledLabel
} from 'browser-components/Form'
import { FormButton, StyledLink } from 'browser-components/buttons'
import FrameAside from 'browser/modules/Frame/FrameAside'
import FrameBodyTemplate from 'browser/modules/Frame/FrameBodyTemplate'
import FrameError from 'browser/modules/Frame/FrameError'
import FrameSuccess from 'browser/modules/Frame/FrameSuccess'
import bolt from 'services/bolt/bolt'
import { NEO4J_BROWSER_USER_ACTION_QUERY } from 'services/bolt/txMetadata'
import {
  commandSources,
  executeCommand
} from 'shared/modules/commands/commandsDuck'
import { isConnectedAuraHost } from 'shared/modules/connections/connectionsDuck'
import {
  addRoleToUser,
  createDatabaseUser,
  listRolesQuery
} from 'shared/modules/cypher/boltUserHelper'
import { ROUTED_CYPHER_WRITE_REQUEST } from 'shared/modules/cypher/cypherDuck'
import {
  canAssignRolesToUser,
  isEnterprise
} from 'shared/modules/dbMeta/dbMetaDuck'
import { driverDatabaseSelection } from 'shared/modules/features/versionedFeatures'

type UserAddState = any

export class UserAdd extends Component<any, UserAddState> {
  constructor(props: {}) {
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

  extractUserNameAndRolesFromBolt(result: any) {
    const tableArray = bolt.recordsToTableArray(result.records)
    tableArray.shift()
    return tableArray
  }

  removeRole(role: any) {
    const roles = this.state.roles.slice()
    roles.splice(this.state.roles.indexOf(role), 1)
    return roles
  }

  listRoles() {
    return (
      !!this.state.roles.length && (
        <StyleRolesContainer className="roles-inline">
          {this.state.roles.map((role: any, i: any) => {
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
    const errors: any = []
    this.state.roles.forEach((role: any) => {
      this.props.bus &&
        this.props.bus.self(
          ROUTED_CYPHER_WRITE_REQUEST,
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
          (response: any) => {
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
        ROUTED_CYPHER_WRITE_REQUEST,
        {
          query: listRolesQuery(Boolean(this.props.useSystemDb)),
          queryType: NEO4J_BROWSER_USER_ACTION_QUERY,
          useDb: this.props.useSystemDb
        },
        (response: any) => {
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

  submit = (event: any) => {
    event.preventDefault()

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
        ROUTED_CYPHER_WRITE_REQUEST,
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
        (response: any) => {
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

  updateUsername(event: any) {
    return this.setState({ username: event.target.value })
  }

  updatePassword(event: any) {
    return this.setState({ password: event.target.value })
  }

  confirmUpdatePassword(event: any) {
    return this.setState({ confirmPassword: event.target.value })
  }

  updateForcePasswordChange() {
    return this.setState({
      forcePasswordChange: !this.state.forcePasswordChange
    })
  }

  availableRoles() {
    return this.state.availableRoles.filter(
      (role: any) => this.state.roles.indexOf(role) < 0
    )
  }

  openListUsersFrame() {
    const action = executeCommand(':server user list', {
      source: commandSources.button
    })
    this.props.bus.send(action.type, action)
  }

  render() {
    const { isLoading } = this.props
    let aside
    let frameContents

    const listOfAvailableRoles = (rolesSelectorId: any) =>
      this.state.availableRoles ? (
        <RolesSelector
          roles={this.availableRoles()}
          className="roles"
          name={rolesSelectorId}
          id={rolesSelectorId}
          onChange={(event: any) => {
            this.setState({
              roles: this.state.roles.concat([event.target.value])
            })
          }}
        />
      ) : (
        '-'
      )

    let errors = this.state.errors ? this.state.errors.join(', ') : null
    // @ts-expect-error ts-migrate(2349) FIXME: This expression is not callable.
    const formId = uuid()
    const usernameId = `username-${formId}`
    const passwordId = `password-${formId}`
    const passwordConfirmId = `password-confirm-${formId}`
    const rolesSelectorId = `roles-selector-${formId}`

    if (this.props.isAura) {
      errors = null
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
        <StyledForm id={`user-add-${formId}`} onSubmit={this.submit}>
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
              data-testid="Add User"
              type="submit"
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
      <FrameBodyTemplate
        isCollapsed={this.props.isCollapsed}
        isFullscreen={this.props.isFullscreen}
        aside={aside}
        contents={frameContents}
        statusBar={getStatusBar()}
      />
    )
  }
}

const mapStateToProps = (state: any) => {
  const { database } = driverDatabaseSelection(state, 'system') || {}
  const isEnterpriseEdition = isEnterprise(state)
  const isAura = isConnectedAuraHost(state)

  return {
    canAssignRolesToUser: canAssignRolesToUser(state),
    useSystemDb: database,
    isEnterpriseEdition,
    isAura
  }
}

export default withBus(connect(mapStateToProps, null)(UserAdd))
