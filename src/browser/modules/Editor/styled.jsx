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
import { dim } from 'browser-styles/constants'

const editorPadding = 10

export const BaseBar = styled.div`
  background-color: ${props => props.theme.editorBackground};
  border-radius: 4px;
  margin: ${editorPadding}px 0px ${editorPadding}px 0;
  display: grid;
`

export const Header = styled.div`
  background-color: gray;
`

export const Bar = styled(BaseBar)`
  ${props => {
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
  }};
`
export const ActionButtonSection = styled.div`
  display: flex;
  justify-content: space-between;
  width: ${props => props.width}px;
  margin-top: 7px;
  margin-right: 7px;
`

const BaseEditorWrapper = styled.div`
  font-family: 'Fira Code', Monaco, 'Courier New', Terminal, monospace;
  flex: auto;
  width: 0; // this makes the editor wrap lines instead of making the editor wider

  min-height: ${props => {
    if (props.expanded) {
      return '100vh'
    }
    if (props.card) {
      // 230 is 10 lines + 2*12px padding
      return '254px'
    }
    return '0'
  }};

  .CodeMirror {
    color: ${props => props.theme.editorCommandColor};
    font-size: 17px;
  }

  .disable-font-ligatures & {
    font-variant-ligatures: none !important;
  }
`

export const EditorWrapper = styled(BaseEditorWrapper)`
  ${props => {
    if (props.expanded) {
      return `height: 100%;
        z-index: 2;
        .CodeMirror {
          position: absolute;
          left: 12px;
          right: 142px;
          top: 12px;
          bottom: 12px;
        }
        .CodeMirror-scroll {
           max-height: initial !important;
        }
      `
    }
  }};
`
