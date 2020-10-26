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

import styled from 'styled-components'
import { StyledTd } from 'browser-components/DataTables'
import {
  StyledInput as Input,
  StyledSelect as Select
} from 'browser-components/Form'

export const StyledUserTd = styled(StyledTd)`
  padding: 10px 16px 10px 0;
`
export const StyledSelect = styled(Select)``
export const StyledInput = styled(Input)``

export const StyledButtonContainer = styled.div`
  padding: 6px 0;

  &.status-indicator::before {
    background-color: #eee;
    border-radius: 5px;
    display: inline-block;
    content: '';
    width: 10px;
    height: 10px;
    margin-right: 5px;
  }

  &.status-active::before {
    background-color: ${props => props.theme.success};
  }
  &.status-suspended::before {
    background-color: ${props => props.theme.warning};
  }
`

export const StyleRolesContainer = styled.div`
  display: flex;
  flex-direction: column;

  &.roles-inline {
    flex-direction: row;
    align-items: flex-start;

    > button {
      margin-right: 5px;
    }
  }

  &:not(:first-child) {
    padding: 10px 0;
  }

  > button {
    margin: 0 0 5px 0;
    &:last-child {
      margin-bottom: 0;
    }
  }
`
