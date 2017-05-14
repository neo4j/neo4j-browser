/*
 * Copyright (c) 2002-2017 "Neo Technology,"
 * Network Engine for Objects in Lund AB [http://neotechnology.com]
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

export const StyledTable = styled.table`
  width: 100%
  margin-bottom: 0
`
export const StyledBodyTr = styled.tr`
  background-color: #fff
`
export const StyledTh = styled.th`
  text-align: left
  height: 39px
  font-weight: bold
  padding: 0 16px
  line-height: 39px
  border-bottom: ${props => props.theme.inFrameBorder}
`
export const StyledTd = styled.td`
  border-bottom: ${props => props.theme.inFrameBorder}
  vertical-align: top
  line-height: 26px
  padding: 0 16px
`

export const StyledJsonTable = styled.table`
  background-color: #eee;
  -webkit-border-radius: 5px;
  border-radius: 5px;
  margin: 20px 10px;
`

export const StyledJsonTableHeader = styled.th`
  border-bottom: none;
  color: #666;
  line-height: 26px;
  padding: 2px 10px;
  max-width: 320px;
`

export const StyledJsonTableRow = styled.tr`
  border-bottom: none;
  color: #666;
  line-height: 26px;
  padding: 2px 10px;
  max-width: 320px;
`

export const StyledJsonTableCell = styled.td`
  border-bottom: none;
  color: #666;
  line-height: 26px;
  padding: 2px 10px;
  max-width: 320px;
`
