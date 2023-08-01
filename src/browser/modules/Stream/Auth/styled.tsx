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

import { StyledFrameAside } from '../../Frame/styled'
import { StyledInput, StyledSelect } from 'browser-components/Form'

export const StyledConnectionForm = styled.form`
  padding: 0 15px;

  flex: 1;
  &.isLoading {
    opacity: 0.5;
  }
`
export const StyledChangePasswordForm = styled(StyledConnectionForm)`
  flex: 1;
`

export const StyledConnectionAside = styled(StyledFrameAside)``
export const StyledConnectionFormEntry = styled.div`
  padding-bottom: 15px;
  &:hover .url-hint-text {
    display: block;
  }
`
export const StyledConnectionLabel = styled.label`
  display: block;
  font-size: 13px;
  font-weight: 600;
  line-height: 2;
  * {
    font-weight: normal;
  }
`
export const StyledConnectionTextInput = styled(StyledInput)`
  min-width: 200px;
  width: 44%;
`

export const StyledSegment = styled.div`
  min-width: 200px;
  width: 44%;
  position: relative;
  display: flex;
  justify-content: left;
  > select {
    border-radius: 4px;
    width: auto;
    min-width: unset;
    display: inline-block;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    text-align: right;
    border: ${props => props.theme.formButtonBorder};
    color: ${props => props.theme.inputText};
    height: 34px;
    font-size: 14px;
    padding: 7px 12px 6px 12px;
    vertical-align: bottom;
  }
  > input {
    display: inline-block;
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
    margin-left: -1px;
    flex: 1;
    min-width: unset;
    width: auto;
  }
`

export const StyledBoltUrlHintText = styled.span`
  height: 0;
  overflow: visible;
  font-size: 12px;
  display: none;
`

export const StyledRevealablePasswordWrapper = styled.div`
  position: relative;
  display: inline-block;
  width: calc(44% + 30px);
  min-width: 200px;

  > input {
    width: calc(100% - 30px);
  }
`

export const StyledRevealIconWrapper = styled.div`
  width: 25px;
  color: ${props => props.theme.primaryText};
  position: absolute;
  user-select: none;
  right: 0;
  top: 5px;
  height: auto;
  padding: 3px;
`

export const StyledConnectionSelect = styled(StyledSelect)`
  min-width: 200px;
  width: 44%;
`

export const StyledConnectionBodyContainer = styled.div`
  flex: 1 1 auto;
`
export const StyledConnectionBody = styled.div`
  flex: 1 1 auto;
  font-size: 1.3em;
  line-height: 2em;
  padding-left: 50px;
`
export const StyledConnectionFooter = styled.span`
  font-size: 0.95em;
  font-weight: 200;
`
export const StyledCode = styled.code`
  color: #fd766e;
  background-color: ${props => props.theme.frameSidebarBackground};
  border-radius: 2px;
  cursor: auto;
  border: none;
  padding: 2px 4px;

  a {
    color: #c7254e !important;
  }
`

export const StyledDbsRow = styled.li``

export const StyledFormContainer = styled.div`
  display: flex;
`
export const StyledSSOLogDownload = styled.button`
  color: ${props => props.theme.primaryButtonText};
  background-color: ${props => props.theme.primary};
  border: 1px solid ${props => props.theme.primary};
  font-family: ${props => props.theme.primaryFontFamily};
  padding: 6px 18px;
  font-weight: 600;
  font-size: 14px;
  text-align: center;
  vertical-align: middle;
  cursor: pointer;
  border-radius: 4px;
  line-height: 20px;

  &:hover {
    background-color: ${props => props.theme.primary50};
    color: ${props => props.theme.secondaryButtonTextHover};
    border: 1px solid ${props => props.theme.primary50};
  }
`

export const StyledSSOButtonContainer = styled.div`
  margin-bottom: 12px;
`
export const StyledSSOError = styled.div`
  margin-top: 30px;
  padding: 3px;
  white-space: pre-line;
  display: flex;
`
