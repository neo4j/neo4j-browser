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
import { dim } from 'browser-styles/constants'

export const StyledStream = styled.div`
  padding: 0;
  display: flex;
  flex-direction: column;
  margin-top: 17px;
  overflow: auto;
  padding: 0px 24px;
`

const rollDownAnimation = keyframes`
  from {
    transform: translate(0, -${dim.frameBodyHeight * 0.3}px);
    opacity: 0;
    height: 0px;
  }
  70% {
    opacity: 0;
    height: 300px;
  }
  to {
    opacity: 1;
  }
`

// Frames
export const StyledFrame = styled.article`
  width: auto;
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0,0,0,.1);
  animation: ${rollDownAnimation} .2s linear;
  border: ${props => props.theme.frameBorder};
  margin: ${props => props.fullscreen ? '0' : '10px 0px 10px 0px'};
  ${props => props.fullscreen ? 'position: fixed' : null};
  ${props => props.fullscreen ? 'left: 0' : null};
  ${props => props.fullscreen ? 'top: 0' : null};
  ${props => props.fullscreen ? 'bottom: 0' : null};
  ${props => props.fullscreen ? 'right: 0' : null};
  ${props => props.fullscreen ? 'z-index: 1030' : null};
`

export const StyledVisContainer = styled.div`
  width: 100%;
  height: ${props => (props.fullscreen ? '100vh' : (dim.frameBodyHeight - (dim.frameTitlebarHeight * 2)) + 'px')};
  display : ${props => props.style.display}
`

export const StyledFrameBody = styled.div`
  min-height: ${dim.frameBodyHeight / 2}px;
  max-height: ${props => props.collapsed ? 0 : (props.fullscreen ? '100%' : (dim.frameBodyHeight - dim.frameStatusbarHeight) + 1 + 'px')};
  display: ${props => props.collapsed ? 'none' : 'flex'};;
  flex-direction: row;
`

export const StyledFrameMainSection = styled.div`
  min-width: 0;
  flex: 1 1 auto;
  height: 100%;
`

export const StyledFrameContents = styled.div`
  overflow: auto;
  min-height: ${dim.frameBodyHeight / 2}px;
  max-height: ${props => (props.fullscreen ? '100vh' : (dim.frameBodyHeight - (dim.frameStatusbarHeight * 2)) + 'px')};
  ${props => props.fullscreen ? 'height: 100vh' : null}
`

export const PaddedDiv = styled.div`
  padding: 0 20px 20px 20px;
  padding-bottom: ${props => (props.fullscreen ? (dim.frameTitlebarHeight + 20) + 'px' : '20px')};
`

export const PaddedTableViewDiv = styled(PaddedDiv)`
  width: 100%
`

export const StyledFrameSidebar = styled.ul`
  line-height: 33px;
  width: 45px;
  margin-left: -5px;
  list-style: none;
  padding-left: 0;
  margin: 0;
  flex: 0 0 auto;
  border-right: ${props => props.theme.inFrameBorder};
  background-color: ${props => props.theme.frameSidebarBackground};
`

export const StyledFrameStatusbar = styled.div`
  border-top: ${props => props.theme.inFrameBorder};
  height: ${dim.frameStatusbarHeight + 3}px;
  ${props => props.fullscreen ? 'margin-top: -78px;' : ''}
`

export const StyledFrameTitleBar = styled.div`
  height: ${dim.frameTitlebarHeight}px;
  border-bottom: ${props => props.theme.inFrameBorder};
  line-height: ${dim.frameTitlebarHeight}px;
  color: ${props => props.theme.frameTitlebarText};
  display: flex;
  flex-direction: row;
`

export const FrameTitlebarButtonSection = styled.ul`
  flex: 0 0 auto;
  margin-left: -5px;
  list-style: none;
  padding-left: 0;
  margin: 0;
  margin-left: auto;
`

export const StyledFrameCommand = styled.label`
  font-family: ${props => props.theme.editorFont};
  font-size: 1.2em;
  line-height: 2.2em;
  margin: 3px 5px 3px 15px;
  flex: 1 1 auto;
  min-width: 0;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  display: block;
  &:before {
    content: '$ '
  }
`
export const DottedLineHover = styled.span`
  cursor: pointer;
  &:hover {
    cursor: pointer;
    border-bottom: 1px dotted #b6adad;
    padding-bottom: 2px;
  }
`

export const StyledHelpFrame = styled.div`
  padding: 30px
`
export const StyledHelpContent = styled.div`
  padding-top: 10px
  padding-bottom: 10px
`
export const StyledHelpDescription = styled.div`
  margin-bottom: 10px
  font-size: 15px
`

export const StyledDiv = styled.div`
`

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
  font-weight: bold
  line-height: 1em
  text-align: center
  white-space: nowrap
  vertical-align: baseline
  user-select: none
  font-size: 12px
  margin-right: 5px
  padding: 4px 7px 4px 5px
  border-radius: 3px
  float: left
`
export const StyledCypherWarningMessage = styled(StyledCypherMessage)`
  background-color: #FFA500
  color: #FFFFFF
`

export const StyledCypherErrorMessage = styled(StyledCypherMessage)`
  background-color: #E74C3C
  color: #FFFFFF
`

export const StyledH4 = styled.h4`
`

export const StyledBr = styled.br`
`

export const StyledPreformattedArea = styled.pre`
  font-family: Monaco, "Courier New", Terminal, monospace;
  font-size: 14px;
  white-space: pre-wrap;
  padding: 12px 16px;
  margin: 0;
  background: none;
  border: none;
  background-color: #f5f5f5;
`

export const ErrorText = styled.span`
  color: ${props => props.theme.error};
  padding-left: 5px;
  line-height: 35px;
`
export const StyledStatsBar = styled.div`
  min-height: 39px;
  line-height: 39px;
  color: #788185;
  font-size: 13px;
  position: relative;
  background-color: #fff;
  white-space: nowrap;
  overflow: hidden;
  padding-left: 24px;
`

export const StyledSchemaBody = styled(StyledPreformattedArea)`
  padding-top: 6px
`
export const StyledBodyMessage = styled.div`
  padding-top: 20px;
  line-height: 1.428;
  font-size: 15px;
  color: #666;
`

export const SpinnerContainer = styled.div`
  padding-top: 20px;
`

export const DropdownButton = styled.li`
  color: ${props => props.theme.secondaryButtonText};
  background-color: transparent;
  border-left: ${props => props.theme.inFrameBorder};
  border-right: ${props => props.theme.inFrameBorder};
  height: ${dim.frameTitlebarHeight}px;
  width: 41px;
  cursor: pointer;
  text-align: center;
  line-height: 40px;
  display: inline-block;
  float: left;
  &:hover {
    background-color: ${props => props.theme.secondaryButtonBackgroundHover};
    color: ${props => props.theme.secondaryBackground};
    fill: ${props => props.theme.secondaryBackground};
    text-decoration: none;
  }
  display: inline-block;
  &:hover {
    > ul li {
    display: block;
    }
  };
`

export const DropdownList = styled.ul`

`

export const DropdownContent = styled.li`
  display: none;
  position: absolute;
  background-color: #ffffff;
  color: #262626;
  width: 100px;
  box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
  border-radius: 6px;
  z-index: 1;
  line-height: 30px;
  padding: 5px 0 5px 0;
`

export const DropdownItem = styled.a`
  background-color: #ffffff;
  color: #262626;
  width: 100%;
  display: inline-block;
  &:hover {
    color: #262626;
    text-decoration: none;
    background-color: #f5f5f5;
  }
`

export const StyledRightPartial = styled.div`
  float: right;
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
  &::-ms-fill-lower, &::-ms-fill-upper {
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
    background-color: #008BC3;
    outline: none;
  }
  &::-moz-range-thumb {
    width: 14px;
    height: 14px;
    border-radius: 7px;
    cursor: pointer;
    border: none;
    background-color: #008BC3;
    outline: none;
  }
  &::-ms-thumb {
    width: 14px;
    height: 14px;
    border-radius: 7px;
    cursor: pointer;
    border: none;
    background-color: #008BC3;
    outline: none;
  }
`
