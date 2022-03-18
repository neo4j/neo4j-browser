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

export const panelMinWidth = 200

export const StyledFullSizeContainer = styled.div`
  position: relative;
  height: 100%;
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
export const StyledNodeInspectorTopMenuChevron = styled.div<{
  expanded: boolean
}>`
  cursor: pointer;
  position: absolute;
  right: 0px;
  top: 6px;
  z-index: 2;
  width: 32px;
  height: 32px;
  padding: 6px;
  color: ${props => props.theme.frameNodePropertiesPanelIconTextColor}
  text-align: center;
  ${props =>
    !props.expanded &&
    `background: ${props.theme.editorBackground};
       box-shadow: ${props.theme.standardShadow};
    `}
`

export const PaneContainer = styled.div`
  padding: 0 14px;
  height: 100%;
  display: flex;
  flex-direction: column;
`

export const PaneHeader = styled.div`
  font-size: 16px;
  margin-top: 10px;
  flex: 0 0 auto;
`

export const PaneBody = styled.div`
  overflow: auto;
  margin: 14px 0;
  flex: 0 1 auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
`

export const PaneTitle = styled.div`
  margin-bottom: 10px;
`
