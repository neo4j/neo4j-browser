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

export const StyledWrapper = styled.div`
  display: flex;
  flex-direction: row;
  height: 100vh;
  font-family: ${props => props.theme.primaryFontFamily};
  font-size: 13px;
  -webkit-font-smoothing: antialiased;
  overflow: hidden;
`

export const StyledApp = styled.div`
  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: 0%;
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
`

export const StyledBody = styled.div`
  flex: auto;
  display: flex;
  flex-direction: row;
  height: inherit;
`

export const StyledMainWrapper = styled.div`
  flex: auto;
  overflow: auto;
  padding: 0;
  z-index: 1;
  height: auto;
  width: 0;
  background-color: ${props => props.theme.primaryBackground};
  color: ${props => props.theme.primaryText};
`
