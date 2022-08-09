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
import styled from 'styled-components'

export const StyledSidebar = styled.div`
  flex: 0 0 auto;
  background-color: #4d4a57;
  display: flex;
  flex-direction: row;
  color: #fff;
`
export const StyledDrawer = styled.div`
  height: 100%;
  flex: 0 0 auto;
  background-color: #31333b;
  overflow-x: hidden;
  overflow-y: auto;
  transition: 0.2s ease-out;
  z-index: 1;
`

export const StyledTabsWrapper = styled.div`
  display: flex;
  flex-direction: column;
`

const StyledTabList = styled.ul`
  margin: 0;
  padding: 0;
`

export const StyledTopNav = styled(StyledTabList)`
  align-self: flex-start;
  & > li {
    border-bottom: transparent;
  }
`
export const StyledBottomNav = styled(StyledTabList)`
  align-self: flex-end;
  margin-top: auto;
  & > li {
    border-top: transparent;
  }
`
