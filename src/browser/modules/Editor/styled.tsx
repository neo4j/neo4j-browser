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

interface ResizeableProps {
  expanded: boolean
  card: boolean
}

const editorPadding = 10

export const BaseBar = styled.div<ResizeableProps>`
  background-color: ${(props): string => props.theme.editorBackground};
  border-radius: 4px;
  margin: ${editorPadding}px 0px ${editorPadding}px 0;
  display: grid;
  // minmax(0, 1fr) prevents the editor from growing the text field
  grid-template-columns: minmax(0, 1fr) auto;
  grid-template-areas: ${(props): string => {
    if (props.expanded || props.card) {
      return "'header' 'editor'"
    }
    return "'editor header'"
  }};
`

export const Header = styled.div<ResizeableProps>`
  grid-area: header;
  border-radius: 4px 4px 0 0;
  ${(props): string => {
    if (props.expanded) {
      return `background-color: #4d4a57;
              border-radius: 0;
      `
    }
    if (props.card) {
      return `background-color: #4d4a57;
              transition-duration: 0.3s;`
    }
    return ''
  }}

  display: flex;
  justify-content: flex-end;
`

export const Bar = styled(BaseBar)<ResizeableProps>`
  ${(props): string => {
    if (props.expanded) {
      return `
position: fixed;
top: -10px;
bottom: 0;
left: 0;
right: 0;
height: 100vh;
border-radius: 0;
z-index: 1030;`
    }
    return ''
  }};
`

interface ActionButtonContainerProps {
  containerWidth: number
}

export const ActionButtonSection = styled.div<ActionButtonContainerProps>`
  display: flex;
  justify-content: space-between;
  width: ${(props): number => props.containerWidth}px;
  margin: 7px;
`

const BaseEditorWrapper = styled.div<ResizeableProps>`
  font-family: 'Fira Code', Monaco, 'Courier New', Terminal, monospace;
  grid-area: editor;

  min-height: ${(props): string => {
    if (props.expanded) {
      return '100vh'
    }
    if (props.card) {
      // 230 is 10 lines + 2*12px padding
      return '254px'
    }
    return '0'
  }};

  ${(props): string => (props.expanded ? '' : 'transition-duration: 0.1s;')}

  .CodeMirror {
    color: ${(props): string => props.theme.editorCommandColor};
    font-size: 17px;
  }

  .disable-font-ligatures & {
    font-variant-ligatures: none !important;
  }
`

export const EditorWrapper = styled(BaseEditorWrapper)<ResizeableProps>`
  ${(props): string => {
    if (props.expanded) {
      return `height: 100%;
        z-index: 2;
        .CodeMirror {
          position: absolute;
          left: 12px;
          right: 142px;
          top: 42px;
          bottom: 12px;
        }
        .CodeMirror-scroll {
           max-height: initial !important;
        }
      `
    } else {
      return ''
    }
  }};
`
