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

export const StyledInlineList = styled.ul`
  list-style: none;
  word-break: break-word;
`

export const StyledInlineListStylePicker = styled(StyledInlineList)`
  display: grid;
  overflow-y: auto;
  max-height: 400px;
  background: ${props => props.theme.editorBackground};
  color: ${props => props.theme.primaryText};
`
export const StyledInlineListItem = styled.li`
  display: inline-block;
  padding-right: 5px;
`

export const StyledToken = styled(StyledInlineListItem)`
  display: inline-block;
  font-weight: bold;
  line-height: 1em;
  text-align: center;
  vertical-align: baseline;
  user-select: none;
  font-size: 12px;
  margin-right: 5px;
  cursor: pointer;
  margin-bottom: 3px;
`
export const StyledLabelToken = styled(StyledToken)`
  padding: 4px 7px 4px 9px;
  border-radius: 20px;
  word-break: break-all;
  margin-top: 4px;
  cursor: default;
`
export const StyledTokenRelationshipType = styled(StyledToken)`
  padding: 4px 7px 4px 5px;
  border-radius: 3px;
  word-break: break-all;
  cursor: default;
`
export const StyledLegendInlineList = styled(StyledInlineList)`
  padding: 4px 0 0 0;
  &.contracted {
    max-height: ${legendRowHeight}px;
    overflow: hidden;
  }
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

export const StyledNodeInspectorContainer = styled.div<{
  width: number
  shouldAnimate: boolean
}>`
  position: absolute;
  right: 0;
  top: 3px;
  z-index: 1;
  width: ${props => props.width}px;
  ${props => props.shouldAnimate && 'transition: 0.2s ease-out;'}
  max-width: 95%;
  height: 100%;
  background: ${props => props.theme.editorBackground};
  color: ${props => props.theme.primaryText};
  font-family: ${props => props.theme.drawerHeaderFontFamily};
  box-shadow: ${props => props.theme.standardShadow};
`

export const PaneWrapper = styled.div`
  padding: 0 14px;
  height: 100%;
  display: flex;
  flex-direction: column;
`

export const PaneHeader = styled.div`
  font-size: 16px;
  margin-top: 10px;
  flex: 0 0 auto;
  overflow: auto;
  max-height: 50%;
`

export const PaneBody = styled.div`
  height: 100%;
  overflow: auto;
  margin: 14px 0;
  flex: 0 1 auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
`

export const PaneTitle = styled.div`
  margin-bottom: 10px;
  display: flex;
  gap: 5px;
  align-items: center;
`

export const PaneBodySectionTitle = styled.span`
  font-weight: 700;
`

export const PaneBodySectionSmallText = styled.span`
  font-size: 0.9rem;
`
export const PaneBodySectionHeaderWrapper = styled.div`
  display: flex;
  flex-direction: column;
`
