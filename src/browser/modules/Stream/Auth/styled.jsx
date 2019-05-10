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

export const StyledConnectionForm = styled.form`
  padding: 0 15px;
`
export const StyledConnectionAside = styled.div`
  display: table-cell;
  padding: 0 15px;
  width: 25%;
  font-family: ${props => props.theme.primaryFontFamily};
  font-size: 16px;
  font-weight: 300;
  color: ${props => props.theme.asideText};
`
export const StyledConnectionFrame = styled.div`
  padding: 30px 45px;
`
export const StyledConnectionFormEntry = styled.div`
  padding-bottom: 15px;
`
export const StyledConnectionLabel = styled.label`
  display: block;
`
export const StyledConnectionTextInput = styled.input`
  display: block;
  height: 34px;
  color: #555;
  font-size: 14px;
  padding: 6px 12px;
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 44%;
`
export const StyledConnectionBodyContainer = styled.div`
  display: table-cell;
`
export const StyledConnectionBody = styled.div`
  display: table-cell;
  font-size: 1.3em;
  line-height: 2em;
  padding-left: 50px;
`
export const StyledConnectionFooter = styled.span`
  font-size: 0.95em;
  font-weight: 200;
`
export const StyledCode = styled.code`
  color: #c7254e;
  background-color: #f9f2f4;
  border-radius: 4px;
  cursor: pointer;
  border: none;
  padding: 2px 4px;
`

export const StyledDbsRow = styled.li``
