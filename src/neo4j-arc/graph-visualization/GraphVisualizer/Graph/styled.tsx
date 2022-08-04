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

export const StyledSvgWrapper = styled.div`
  line-height: 0;
  height: 100%;
  position: relative;
  > svg {
    height: 100%;
    width: 100%;
    background-color: ${props => props.theme.frameBackground};
    .node {
      cursor: pointer;
      > .ring {
        fill: none;
        opacity: 0;
        stroke: #6ac6ff;
      }
      &.selected {
        > .ring {
          stroke: #fdcc59;
          opacity: 0.3;
        }
      }
      &:hover {
        > .ring {
          stroke: #6ac6ff;
          opacity: 0.3;
        }
      }
    }
    .relationship {
      > text {
        fill: ${props => props.theme.primaryText};
      }
      > .overlay {
        opacity: 0;
        fill: #6ac6ff;
      }
      &.selected {
        > .overlay {
          fill: #fdcc59;
          opacity: 0.3;
        }
      }
      &:hover {
        > .overlay {
          fill: #6ac6ff;
          opacity: 0.3;
        }
      }
    }
    .remove_node {
      .expand_node {
        &:hover {
          border: 2px #000 solid;
        }
      }
    }
    .b-outline {
      cursor: pointer;
    }
    path {
      &.context-menu-item {
        stroke-width: 2px;
        fill: ${props => props.theme.primaryBackground};
      }
    }
    text {
      line-height: normal;
      &.context-menu-item {
        fill: #fff;
        text-anchor: middle;
        pointer-events: none;
        font-size: 14px;
      }
    }
    .context-menu-item {
      cursor: pointer;
      &:hover {
        fill: #b9b9b9;
        font-size: 14px;
      }
    }
  }
`

export const StyledZoomHolder = styled.div<{
  isFullscreen: boolean
  offset: number
}>`
  position: ${props => (props.isFullscreen ? 'fixed' : 'absolute')};
  display: flex;
  flex-direction: column;
  bottom: 8px;
  right: ${props => props.offset}px;
  border-left: ${props => props.theme.inFrameBorder};
  border-right: ${props => props.theme.inFrameBorder};
  border-top: ${props => props.theme.inFrameBorder};
  background: ${props => props.theme.frameSidebarBackground};
  box-shadow: ${props => props.theme.standardShadow};
`

export const StyledZoomButton = styled.button`
  border: none;
  color: ${props => props.theme.frameButtonTextColor};
  background: transparent;
  padding: 8px;
  &:hover {
    background: ${props => props.theme.frameButtonHoverBackground};
    border-radius: 2px;
  }
  &:enabled:active {
    background: ${props => props.theme.frameButtonActiveBackground};
  }
  &:focus {
    outline: none;
  }
  &:disabled {
    opacity: 0.3;
    cursor: auto;
  }
`

export const StyledZoomInfoOverlay = styled.div`
  position: absolute;
  width: 100%;
  bottom: 20px;
  display: flex;
  flex-direction: row;
  pointer-events: none;
`

export const StyledZoomInfo = styled.div`
  background: ${props => props.theme.infoBackground};
  position: relative;
  border: ${props => props.theme.infoBorder};
  border-radius: 4px;
  box-shadow: ${props => props.theme.standardShadow}
  margin-left: auto;
  margin-right: auto;
  padding: 10px;
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  align-items: baseline;
  gap: 10px;
  pointer-events: auto;
`

export const StyledZoomInfoTextContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
`

export const StyledZoomInfoText = styled.span`
  line-height: 15px;
`

export const StyledZoomInfoIconContainer = styled.div`
  color: ${props => props.theme.infoIconColor};
`

export const StyledZoomInfoOverlayDoNotDisplayButton = styled.button`
  padding: 0 30px;
  font-size: 12px;
  line-height: 15px;
  border: none;
  outline: none;
  background-color: inherit;
  text-decoration-line: underline;
`
