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

import styled, { keyframes } from 'styled-components'
import { StyledCodeBlock } from '../ClickToCode/styled'
import { SyncSignInButton } from 'browser-components/buttons'

const grow = height => {
  return keyframes`
    0% {
      max-height: 0px;
    }
    100% {
      max-height: ${height};
    }
  `
}

export const StyledMain = styled.div`
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  min-width: 0;
  position: relative;
  height: 100vh;
`

export const Banner = styled.div`
  line-height: 49px;
  min-height: 49px;
  color: white;
  padding: 0 24px;
  margin: 0 24px;
  overflow: hidden;
  animation: ${grow('49px')} 0.3s ease-in;
  flex: 0 0 49px;
`

export const ErrorBanner = styled(Banner)`
  background-color: ${props => props.theme.error};
`
export const WarningBanner = styled(Banner)`
  background-color: ${props => props.theme.warning};
`
export const NotAuthedBanner = styled(Banner)`
  background-color: ${props => props.theme.auth};
`

export const StyledCodeBlockAuthBar = styled(StyledCodeBlock)`
  background-color: white;
  color: ${props => props.theme.auth};
`
export const StyledCodeBlockErrorBar = styled(StyledCodeBlock)`
  background-color: white;
  color: ${props => props.theme.error};
`
export const StyledCodeBlockFrame = styled(StyledCodeBlock)`
  white-space: nowrap;
  overflow: hidden;
  color: #c7254e;
  background-color: #f9f2f4;
  border-radius: 4px;
  cursor: pointer;
`

export const SyncDisconnectedBanner = styled(Banner)`
  background-color: ${props => props.theme.auth};
  display: flex;
  justify-content: space-between;
`

export const SyncSignInBarButton = styled(SyncSignInButton)`
  padding: 0 8px 0 8px;
  margin: 0 12px 0 12px;
  vertical-align: baseline;
  border: none;
`
export const StyledCancelLink = styled.a`
  cursor: pointer;
  text-decoration: none;
  color: #d0d0d0;
  &:hover {
    color: #ffffff;
    text-decoration: none;
  }
`
export const StyledSyncReminderSpan = styled.span`
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  float: left;
`

export const StyledSyncReminderButtonContainer = styled.div`
  float: right;
`
