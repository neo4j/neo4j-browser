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

export const legendRowHeight = 32
export const inspectorFooterContractedHeight = 22
const pMarginTop = 6

// Themes is here because the colors are unique to this component
const getColor = (theme, name) => {
  const themes = {
    normal: {
      svgBackground: '#f9fbfd'
    },
    dark: {
      svgBackground: '#292C33'
    }
  }
  if (themes[theme] === undefined) theme = 'normal'
  return themes[theme][name] || ''
}

export const StyledSvgWrapper = styled.div`
  line-height: 0;
  height: 100%;
  position: relative;
  > svg {
    height: 100%;
    width: 100%;
    background-color: ${props => getColor(props.theme.name, 'svgBackground')};
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
    .outline {
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
export const StyledStream = styled.div`
  padding: 0;
  display: flex;
  flex-direction: column;
`

export const p = styled.div`
  margin-top: ${pMarginTop}px;
  font-size: 12px;
  width: 100%;
  white-space: normal;
`

export const StyledRowToggle = styled.div`
  float: right;
  display: block;
  width: 21px;
  height: 21px;
  line-height: 21px;
  text-align: center;
  cursor: pointer;
`
export const StyledCaret = styled.div`
  font-size: 17px;
  vertical-align: middle;
`

export const StyledInspectorFooter = styled.div`
  margin-top: 6px;
  font-size: 12px;
  width: 100%;
  white-space: normal;
  overflow: scroll;
  &.contracted {
    max-height: ${inspectorFooterContractedHeight}px;
    overflow: hidden;
  }
`

export const StyledInspectorFooterRow = styled.ul`
  list-style: none;
  word-break: break-word;
  line-height: 21px;
`

export const StyledInspectorFooterRowListKey = styled.div`
  float: left;
  font-weight: 800;
`

export const StyledInspectorFooterRowListValue = styled.div`
  padding-left: 3px;
  overflow: hidden;
  float: left;
  white-space: pre-wrap;
`

export const StyledInlineList = styled.ul`
  padding-left: 0;
  list-style: none;
  word-break: break-word;
`

export const StyledInlineListItem = styled.li`
  display: inline-block;
  padding-right: 5px;
  padding-left: 5px;
`

export const StyledStatusBarWrapper = styled.div`
  height: 68px;
  display: none;
`
export const StyledStatusBar = styled.div`
  min-height: 39px;
  line-height: 39px;
  color: ${props => props.theme.secondaryText};
  font-size: 13px;
  position: absolute;
  background-color: ${props => props.theme.frameCommandBackground};
  white-space: nowrap;
  overflow: hidden;
  bottom: 0;
  left: 0;
  right: 0;
  border-top: ${props => props.theme.inFrameBorder};
`

export const StyledStatus = styled.div`
  position: relative;
  float: left;
  padding-left: 16px;
  margin-top: 0;
  margin-bottom: 0;
  width: 100%;
  margin-top: 3px;
  max-height: 64px;
  overflow: auto;
`

export const StyledInspectorFooterRowListPair = styled(StyledInlineListItem)`
  vertical-align: middle;
  font-size: 13px;
`

export const StyledToken = styled(StyledInlineListItem)`
  display: inline-block;
  font-weight: bold;
  line-height: 1em;
  text-align: center;
  white-space: nowrap;
  vertical-align: baseline;
  user-select: none;
  font-size: 12px;
  margin-right: 5px;
  cursor: pointer;
`
export const StyledLabelToken = styled(StyledToken)`
  padding: 4px 7px 4px 9px;
  border-radius: 20px;
`
export const StyledTokenRelationshipType = styled(StyledToken)`
  padding: 4px 7px 4px 5px;
  border-radius: 3px;
`

export const tokenPropertyKey = styled(StyledToken)`
  padding: 3px 5px 3px 5px;
`
export const StyledTokenContextMenuKey = styled(StyledLabelToken)`
  color: #f9fbfd;
  background-color: #d2d5da;
  padding: 4px 9px;
`

export const StyledTokenCount = styled.span`
  font-weight: normal;
`
export const StyledLegendContents = styled.ul`
  float: left;
  line-height: 1em;
  position: relative;
  top: 3px;
  top: -1px;
`

export const StyledLegendRow = styled.div`
  border-bottom: transparent;
  background-color: ${props => props.theme.frameCommandBackground};
  &.contracted {
    max-height: ${legendRowHeight}px;
    overflow: hidden;
  }
`
export const StyledLegend = styled.div`
  background-color: ${props => props.theme.secondaryBackground};
  position: absolute;
  z-index: 1;
  top: 0;
  right: 0;
  left: 0;
`
export const StyledLegendInlineList = styled(StyledInlineList)`
  padding: 7px 9px 0px 10px;
`
export const StyledLegendInlineListItem = styled(StyledInlineListItem)`
  display: inline-block;
  margin-bottom: 3px;
`
export const StyledPickerListItem = styled(StyledInlineListItem)`
  padding-right: 5px;
  padding-left: 0;
  vertical-align: middle;
  line-height: 0;
`

export const StyledPickerSelector = styled.a`
  background-color: #aaa;
  display: inline-block;
  height: 12px;
  width: 12px;
  margin-top: 1px;
  line-height: 0;
  cursor: pointer;
  opacity: 0.4;
  &:hover {
    opacity: 1;
  }
  &.active {
    opacity: 1;
  }
`
export const StyledCircleSelector = styled(StyledPickerSelector)`
  border-radius: 50%;
`
export const StyledCaptionSelector = styled.a`
  cursor: pointer;
  user-select: none;
  display: inline-block;
  padding: 1px 6px;
  font-size: 12px;
  line-height: 1em;
  color: #9195a0;
  border: 1px solid #9195a0;
  overflow: hidden;
  border-radius: 0.25em;
  margin-right: 0;
  font-weight: bold;
  &:hover {
    border-color: #aaa;
    color: #aaa;
    text-decoration: none;
  }
  &.active {
    color: white;
    background-color: #9195a0;
  }
`

export const StyledFullSizeContainer = styled.div`
  position: relative;
  height: 100%;
`

export const StyledInspectorFooterStatusMessage = styled.div`
  font-weight: bold;
`

export const StyledZoomHolder = styled.div`
  position: absolute;
  bottom: 39px;
  right: 0;
  padding: 6px 6px 0 6px;
  border-left: #e6e9ef solid 1px;
  border-top: #e6e9ef solid 1px;
  background: #fff;
`

export const StyledZoomButton = styled.button`
  display: list-item;
  list-style-type: none;
  font-size: 2em;
  margin-bottom: 10px;
  border: none;
  color: #9b9da2;
  background: transparent;
  border-color: black;
  padding: 2px 6px 3px;
  &:hover {
    color: black;
  }
  &:focus {
    outline: none;
  }
  &.faded {
    opacity: 0.3;
    cursor: auto;
    &:hover {
      color: #9b9da2;
    }
  }
`
