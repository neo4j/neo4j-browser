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
import styled, { keyframes } from 'styled-components'

import { StyledFrameButton } from '../../components/buttons'
import { dim } from 'browser-styles/constants'

export const StyledStream = styled.div`
  padding: 0 10px;
  display: flex;
  flex-direction: column;
  overflow: auto;
`
export const Padding = styled.div`
  padding-top: 100px;
`

// Frames
export const PaddedDiv = styled.div<{ isFullscreen?: boolean }>`
  padding: 0 20px 20px 20px;
  padding-bottom: ${props =>
    props.isFullscreen ? dim.frameTitlebarHeight + 20 + 'px' : '20px'};
`

export const DottedLineHover = styled.span`
  cursor: pointer;
  &:hover {
    cursor: pointer;
    border-bottom: 1px dotted #b6adad;
    padding-bottom: 2px;
  }
  text-overflow: ellipsis;
`

export const StyledHelpFrame = styled.div`
  padding: 30px;
`
export const StyledHelpContent = styled.div`
  padding-top: 10px;
  padding-bottom: 10px;
`
export const StyledHelpDescription = styled.div`
  margin-bottom: 10px;
  font-size: 15px;
`

export const StyledDiv = styled.div``

export const StyledLink = styled.a`
  cursor: pointer;
  text-decoration: none;
  &:hover {
    color: #5dade2;
    text-decoration: none;
  }
`

export const StyledLinkContainer = styled.div`
  margin: 16px 0;
`

export const StyledCypherMessage = styled.div`
  font-weight: bold;
  line-height: 1em;
  text-align: center;
  white-space: nowrap;
  vertical-align: baseline;
  user-select: none;
  font-size: 12px;
  margin-right: 5px;
  padding: 4px 7px 4px 5px;
  border-radius: 3px;
`
export const StyledCypherWarningMessage = styled(StyledCypherMessage)`
  margin-bottom: 10px;
  background-color: ${props => props.theme.warning};
  color: #ffffff;
  display: inline-block;
`

export const StyledCypherErrorMessage = styled(StyledCypherMessage)`
  margin-bottom: 10px;
  background-color: ${props => props.theme.error};
  color: #ffffff;
  display: inline-block;
`

export const StyledCypherSuccessMessage = styled(StyledCypherMessage)`
  margin-bottom: 10px;
  background-color: ${props => props.theme.success};
  color: #ffffff;
  display: inline-block;
`

export const StyledCypherInfoMessage = styled(StyledCypherMessage)`
  margin-bottom: 10px;
  background-color: ${props => props.theme.info};
  color: #ffffff;
  display: inline-block;
`

export const StyledInfoMessage = styled(StyledCypherMessage)`
  margin-bottom: 10px;
  background-color: ${props => props.theme.info};
  color: #ffffff;
  display: inline-block;
`

export const StyledH4 = styled.h4``

export const StyledErrorH4 = styled.h4`
  display: inline-block;
`

export const StyledBr = styled.br``

export const StyledPreformattedArea = styled.pre`
  font-family: 'Fira Code', Monaco, 'Courier New', Terminal, monospace;
  font-size: 14px;
  white-space: pre-wrap;
  padding: 12px 16px;
  margin: 0;
  background: none;
  border: none;
  background-color: ${props => props.theme.primaryBackground};
  color: ${props => props.theme.preText};

  .disable-font-ligatures & {
    font-variant-ligatures: none !important;
  }
`

export const ErrorText = styled.span`
  color: ${props => props.theme.error};
  padding-left: 5px;
  line-height: 35px;
`

export const SuccessText = styled.span`
  color: ${props => props.theme.success};
  padding-left: 5px;
  line-height: 35px;
`

export const StyledStatsBarContainer = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
`
export const StyledStatsBar = styled.div`
  display: flex;
  min-height: 39px;
  line-height: 39px;
  color: ${props => props.theme.secondaryText};
  font-size: 13px;
  position: relative;
  white-space: nowrap;
  overflow: hidden;
  padding-left: 24px;
  width: 100%;
`

export const StyledStatsBarWarningMessageWrapper = styled.div`
  flex: 0 0 auto;
`

export const StyledAsciiPre = styled.pre`
  font-family: 'Courier New', monospace;
`

export const StyledTruncatedMessage = styled.span`
  color: orange;
`

export const StyledOneRowStatsBar = styled(StyledStatsBar)`
  height: 39px;
`

export const StyledBodyMessage = styled.div`
  padding-top: 20px;
  line-height: 1.428;
  font-size: 15px;
  color: ${props => props.theme.secondaryText};
`

export const SpinnerContainer = styled.div`
  padding-top: 90px;
`

export const DropdownButton = styled(StyledFrameButton)`
  overflow: unset;

  &:hover {
    position: relative;
    z-index: 9999;
    > ul li {
      display: block;
    }
  }
`

export const DropdownList = styled.ul``

export const DropdownContent = styled.li`
  display: none;
  position: absolute;
  margin-top: 15px;
  right: 0px;
  background-color: ${props => props.theme.secondaryBackground};
  color: ${props => props.theme.secondaryButtonText};
  width: 135px;
  box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  z-index: 1;
  text-align: left;
  line-height: 30px;
  padding: 5px 0;
`

export const DropdownItem = styled.a`
  background-color: ${props => props.theme.secondaryBackground};
  color: ${props => props.theme.secondaryButtonText};
  width: 100%;
  display: inline-block;
  padding: 0 10px;
  &:hover {
    color: ${props => props.theme.secondaryButtonTextHover};
    text-decoration: none;
    background-color: ${props => props.theme.secondaryButtonBackgroundHover};
  }
`

export const DropDownItemDivider = styled.hr`
  border-top: ${props => props.theme.inFrameBorder};
  margin: 0;
`

export const StyledRightPartial = styled.div`
  float: right;
`

export const StyledLeftPartial = styled.div`
  float: left;
`

export const StyledWidthSliderContainer = styled.div`
  margin-right: 10px;
  text-transform: uppercase;
  font-weight: bold;
  font-size: 11px;
`

export const StyledWidthSlider = styled.input`
  width: 150px;
  background: transparent;
  margin-left: 10px;
  vertical-align: middle;
  -webkit-appearance: none;
  outline: none;
  -webkit-tap-highlight-color: rgba(255, 255, 255, 0);
  background: #ddd;
  border-radius: 14px;
  padding: 1px 2px;
  &::-moz-range-track {
    border: inherit;
    background: transparent;
  }
  &::-ms-track {
    border: inherit;
    color: transparent;
    background: transparent;
  }
  &::-ms-fill-lower,
  &::-ms-fill-upper {
    background: transparent;
  }
  &::-ms-tooltip {
    display: none;
  }
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 14px;
    height: 14px;
    border-radius: 7px;
    cursor: pointer;
    border: none;
    background-color: #008bc3;
    outline: none;
  }
  &::-moz-range-thumb {
    width: 14px;
    height: 14px;
    border-radius: 7px;
    cursor: pointer;
    border: none;
    background-color: #008bc3;
    outline: none;
  }
  &::-ms-thumb {
    width: 14px;
    height: 14px;
    border-radius: 7px;
    cursor: pointer;
    border: none;
    background-color: #008bc3;
    outline: none;
  }
`

export const StyledTable = styled.table`
  margin-top: 30px;
`

export const StyledTBody = styled.tbody`
  & td:first-child {
    vertical-align: top;
    width: 170px;
    min-width: 170px;
  }
`

export const StyledExpandable = styled.div`
  margin: 0 10px;
`

export const StyledAlteringTr = styled.tr`
  &:nth-child(even) {
    background-color: ${props => props.theme.alteringTableRowBackground};
  }
`

export const StyledStrongTd = styled.td`
  font-weight: bold;
  padding-left: 4px;
`

export const StyledTd = styled.td``

export const UnstyledList = styled.ul`
  list-style: none;
  width: 100%;
`

export const StyledHistoryRow = styled.li`
  border: 1px solid black;
  margin: 10px;
  padding: 10px;
  cursor: pointer;
  &:hover {
    background-color: ${props => props.theme.primaryBackground};
  }
`

const rollDownAnimation = keyframes`
  from {
    transform: translate(0, -${dim.frameBodyHeight}px);
    max-height: 0;
  }
  to {
    transform: translateY(0);
    max-height: 500px; /* Greater than a frame can be */
  }
`
export const AnimationContainer = styled.div`
  margin-top: 10px;
  animation: ${rollDownAnimation} 0.4s ease-in;
`

export const PromotionContainer = styled.div`
  display: flex;
  align-items: center;
  font-size: 14px;
  margin-top: 20px;
  justify-content: center;
`

export const AuraPromoLink = styled.a`
  cursor: pointer;
  text-decoration: none;
  margin-right: 5px;
`

export const AliasText = styled.span`
  font-size: 1rem;
  font-style: italic;
`

export const StyledMissingParamsTemplateLink = styled.div`
  display: flex;
  flex-direction: column;
  align-items: start;
  padding: 8px 0;
  gap: 5px;
`

export const StyledParamsTemplateClickableArea = styled.a`
  font-family: ${props => props.theme.codeBlockFont};
  font-size: 12px;
  line-height: 18px;
  background: ${props => props.theme.codeBlockBackground};
  color: ${props => props.theme.codeBlockTextColor};
  cursor: pointer;
  text-decoration: none;
  padding: 0 5px;
  &:hover {
    background: ${props => props.theme.codeBlockHoveBackground};
    color: ${props => props.theme.codeBlockTextColor};
    text-decoration: none;
  }
`
export const StyledSpecifyParamsText = styled.span`
  color: ${props => props.theme.primaryText};
`

export const StyledCode = styled.code`
  font-family: ${props => props.theme.codeBlockFont};
  background-color: ${props => props.theme.frameSidebarBackground};
  border-radius: 2px;
  cursor: auto;
  border: none;
  padding: 2px 4px;
`
