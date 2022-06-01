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

import { SpinnerIcon } from 'browser-components/icons/LegacyIcons'

import { SpinnerContainer, StyledBodyMessage } from '../styled'
import Centered from 'browser-components/Centered'
import {
  REQUEST_STATUS_CANCELED,
  REQUEST_STATUS_CANCELING,
  Status
} from 'shared/modules/requests/requestsDuck'

interface CancelViewProps {
  requestStatus: Status
}

export const CancelView = ({ requestStatus }: CancelViewProps): JSX.Element => (
  <Centered>
    <SpinnerContainer>
      {requestStatus === REQUEST_STATUS_CANCELING && <SpinnerIcon />}
    </SpinnerContainer>
    <StyledBodyMessage>
      {requestStatus === REQUEST_STATUS_CANCELING && (
        <div>Terminating active query...</div>
      )}
      {requestStatus === REQUEST_STATUS_CANCELED && <div>Query terminated</div>}
    </StyledBodyMessage>
  </Centered>
)
