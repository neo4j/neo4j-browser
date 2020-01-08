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

import Render from 'browser-components/Render'
import {
  DrawerSubHeader,
  DrawerSection,
  DrawerSectionBody
} from 'browser-components/drawer'
import { StyledTable, StyledKey, StyledValue, Link } from './styled'

export class UserDetails extends Component {
  render() {
    const userDetails = this.props.user
    const roles = userDetails && userDetails.roles ? userDetails.roles : []
    if (userDetails.username) {
      const mappedRoles = roles.length > 0 ? roles.join(', ') : '-'
      const hasAdminRole = roles
        .map(role => role.toLowerCase())
        .includes('admin')
      return (
        <DrawerSection className="user-details">
          <DrawerSubHeader>Connected as</DrawerSubHeader>
          <DrawerSectionBody>
            <StyledTable>
              <tbody>
                <tr>
                  <StyledKey>Username:</StyledKey>
                  <StyledValue data-testid="user-details-username">
                    {userDetails.username}
                  </StyledValue>
                </tr>
                <tr>
                  <StyledKey>Roles:</StyledKey>
                  <StyledValue data-testid="user-details-roles">
                    {mappedRoles}
                  </StyledValue>
                </tr>
                <Render if={hasAdminRole}>
                  <tr>
                    <StyledKey className="user-list-button">Admin:</StyledKey>
                    <StyledValue>
                      <Link
                        onClick={() =>
                          this.props.onItemClick(':server user list')
                        }
                      >
                        :server user list
                      </Link>
                    </StyledValue>
                  </tr>
                  <tr>
                    <StyledKey className="user-list-button" />
                    <StyledValue>
                      <Link
                        onClick={() =>
                          this.props.onItemClick(':server user add')
                        }
                      >
                        :server user add
                      </Link>
                    </StyledValue>
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
