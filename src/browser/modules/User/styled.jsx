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
  padding: 10px 0;
`
export const StyledSelect = styled.select`
  border: ${props => props.theme.secondaryButtonBorder};
  color: #555;
  height: 28px;
  font-size: 16px;
  overflow: hidden;
  margin-right: 20px;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 150px;
  vertical-align: top;
`
export const StyledInput = styled.input`
  margin: 0 10px;
  padding: 0 5px;
  border: ${props => props.theme.secondaryButtonBorder};
  border-radius: 4px;
`
export const StyledButtonContainer = styled.div`
  margin: 0 10px;
  padding: 10px 0;
`
