/*
 * Copyright (c) 2002-2019 "Neo4j,"
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

export const StyledUserTd = styled(StyledTd)`
  padding: 10px 16px 10px 0;
`
export const StyledSelect = styled.select`
  background-color: #fff;
  border: ${props => props.theme.secondaryButtonBorder};
  border-radius: 4px;
  color: ${props => props.theme.inputText};
  display: block;
  height: 34px;
  font-size: 14px;
  padding: 6px 12px;
  min-width: 120px;
  width: 100%;
`
export const StyledInput = styled.input`
  background-color: #fff;
  border: ${props => props.theme.secondaryButtonBorder};
  border-radius: 4px;
  color: ${props => props.theme.inputText};
  display: block;
  height: 34px;
  font-size: 14px;
  padding: 6px 12px;
  width: 100%;
`
export const StyledButtonContainer = styled.div`
  padding: 10px 0;
`

export const StyleRolesContainer = styled.div`
  display: flex;
  flex-direction: column;

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
