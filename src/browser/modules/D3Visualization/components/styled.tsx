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

export const legendRowHeight = 32
export const inspectorFooterContractedHeight = 22
const pMarginTop = 6

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

export const StyledGraphAreaContainer = styled.div`
  position: relative;
  height: 100%;
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

export const StyledDetailsStatusContents = styled.div`
  margin-top: 6px;
  font-size: 12px;
  width: 100%;
  white-space: normal;
  overflow: auto;
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

export const StyledInspectorFooterRowListKeyValuePair = styled.div`
  flex: 1;
  display: flex;
`

export const StyledInspectorFooterRowListKey = styled.div`
  float: left;
  font-weight: 800;
  flex: 1;
`

export const StyledInspectorFooterRowListValue = styled.div`
  padding: 0 3px;
  overflow: hidden;
  float: left;
  white-space: pre-wrap;
  flex: 3;
`

export const StyledInlineList = styled.ul`
  padding-left: 0;
  list-style: none;
  word-break: break-word;
`

export const StyledInlineListStylePicker = styled(StyledInlineList)<{
  frameHeight: number
}>`
  display: grid;
  overflow-y: auto;
  max-height: ${props => props.frameHeight - 75}px;
  background: ${props => props.theme.editorBackground};
  color: ${props => props.theme.primaryText};
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

export const StyledStatusBar = styled.div<{ fullscreen?: boolean }>`
  min-height: 39px;
  line-height: 39px;
  color: ${props => props.theme.secondaryText};
  font-size: 13px;
  position: ${props => (props.fullscreen ? 'fixed' : 'absolute')};
  z-index: ${props => (props.fullscreen ? 1 : 'auto')};
  background-color: ${props => props.theme.frameBackground};
  white-space: nowrap;
  overflow: hidden;
  bottom: 0;
  left: 0;
  right: 0;
  border-top: ${props => props.theme.inFrameBorder};
`

export const StyledDetailsStatusBar = styled.div`
  color: ${props => props.theme.secondaryText};
  font-size: 13px;
  white-space: nowrap;
  border-top: ${props => props.theme.inFrameBorder};
  width: 100%;
  height: 100%;
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

export const StyledDetailsStatus = styled.div`
  position: relative;
  float: left;
  padding-left: 16px;
  margin-top: 0;
  margin-bottom: 0;
  width: 100%;
  margin-top: 3px;
`

export const StyledInspectorFooterRowListPair = styled(StyledInlineListItem)`
  vertical-align: middle;
  font-size: 13px;
`

export const StyledInspectorFooterRowListPairAlternatingRows = styled(
  StyledInspectorFooterRowListPair
)<{
  isFirstOrEvenRow: boolean
}>`
  display: flex;
  padding: 5px;
  background: ${props =>
    props.isFirstOrEvenRow
      ? props.theme.alteringTableRowBackground
      : props.theme.editorBackground};
`

export const StyledInspectorClipboardCopyAll = styled.div`
  display: flex;
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
  &.contracted {
    max-height: ${legendRowHeight}px;
    overflow: hidden;
  }
  border-bottom: ${props => props.theme.inFrameBorder};
`

export const StyledLegend = styled.div`
  position: absolute;
  z-index: 1;
  right: 0;
  left: 0;
  padding: 0 15px;
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

export const StyledZoomHolder = styled.div<{ fullscreen: boolean }>`
  position: ${props => (props.fullscreen ? 'fixed' : 'absolute')};
  left: 0;
  top: 0
  padding: 6px 6px 0 6px;
  border-left: ${props => props.theme.inFrameBorder};
  border-right: ${props => props.theme.inFrameBorder};
  border-top: ${props => props.theme.inFrameBorder};
  background: ${props => props.theme.frameSidebarBackground};
`

export const StyledZoomButton = styled.button`
  display: list-item;
  list-style-type: none;
  margin-bottom: 10px;
  border: none;
  color: ${props => props.theme.frameButtonTextColor}
  background: transparent;
  border-color: black;
  padding: 2px 6px 3px;
  &:hover {
    opacity: 0.7;
  }
  &:focus {
    outline: none;
  }
  &.faded {
    opacity: 0.3;
    cursor: auto;
    &:hover {
      color: ${props => props.theme.frameButtonTextColor}
    }
  }
`

export const StyledNodeInspectorCollapsedButton = styled.div`
  position: absolute;
  display: flex;
  right: 0;
  top: 0;
  z-index: 1;
  background: ${props => props.theme.editorBackground};
  color: ${props => props.theme.primaryText};
  border-radius: 2px;
  width: 24px;
  height: 24px;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`
export const StyledNodeInspectorContainer = styled.div`
  position: absolute;
  display: flex;
  flex-direction: column;
  right: 0;
  height: calc(100% - 39px); // 39px is Inspector footer height
  top: 0;
  z-index: 1;
  width: 25%;
  background: ${props => props.theme.editorBackground};
  color: ${props => props.theme.primaryText};
  overflow-y: auto;
  padding: 0 10px;
`
export const StyledNodeInspectorTopMenu = styled.div`
  height: 20px;
  margin: 10px 0 10px 0;
  display: flex;
  flex-direction: row;
`

export const StyledNodeInspectorPane = styled.div<{
  isActive: boolean
}>`
  cursor: pointer;
  margin: 0 15px;
  border-bottom: ${props => (props.isActive ? '1px solid #018BFF' : 'none')};
  font-weight: ${props => (props.isActive ? 'bold' : 'normal')};
`

export const StyledNodeInspectorTopMenuChevron = styled.div`
  cursor: pointer;
  position: absolute;
  margin-right: 15px;
  right: 0;
`
