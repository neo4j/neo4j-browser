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
import React from 'react'

import {
  StyledCode,
  StyledConnectionBody,
  StyledConnectionFooter
} from './styled'

const ConnectedView = ({
  host,
  username,
  storeCredentials,
  hideStoreCredentials = false,
  additionalFooter = null,
  showHost = true
}: any) => {
  return (
    <StyledConnectionBody>
      {username ? (
        <span>
          You are connected as user <StyledCode>{username}</StyledCode>
          <br />
        </span>
      ) : (
        'You are connected '
      )}
      {showHost && (
        <span>
          to <StyledCode>{host}</StyledCode>
          <br />
        </span>
      )}
      {!hideStoreCredentials && (
        <StyledConnectionFooter>
          Connection credentials are {storeCredentials ? '' : 'not '}
          stored in your web browser.
        </StyledConnectionFooter>
      )}
      {additionalFooter && (
        <StyledConnectionFooter>{additionalFooter}</StyledConnectionFooter>
      )}
    </StyledConnectionBody>
  )
}
export default ConnectedView
