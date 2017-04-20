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

import styled, { keyframes } from 'styled-components'

const pushRight = keyframes`
  from {
    transform: translate(0, 0);
    width: 0px;
  }
  to {
    opacity: 1;
  }
`

export const StyledSidebar = styled.div`
  flex: content;
  background-color: #4C4957;
  display: flex;
  flex-direction: row;
  border-right: 1px solid black;
  color: #fff;
`

export const StyledDrawer = styled.div`
  flex: 0 0 300px;
  width: 300px;
  background-color: #30333A;
  overflow: auto;
  animation: ${pushRight} .2s linear;
`

export const HiddenDrawer = styled.div`
 display: none;
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
    border-bottom: 1px solid #5d6370;
  }
`
export const StyledBottomNav = styled(StyledTabList)`
  align-self: flex-end;
  margin-top: auto;
  & > li {
    border-top: 1px solid #5d6370;
  }
`
