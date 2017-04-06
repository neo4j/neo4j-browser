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

export const StyledConnectionForm = styled.form`
  display: table-cell;
  padding: 0 15px;
`
export const StyledConnectionAside = styled.div`
  display: table-cell;
  padding: 0 15px;
  width: 25%;
  font-family: ${props => props.theme.primaryFontFamily};
  font-size: 15px;
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
