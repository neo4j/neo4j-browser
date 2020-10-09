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

interface FullscreenProps {
  fullscreen: boolean
}
interface CardSizeProps {
  cardSize: boolean
}
type ResizeableProps = CardSizeProps & FullscreenProps

const editorPadding = 10

export const Bar = styled.div`
  background-color: ${(props): string => props.theme.frameSidebarBackground};
  display: grid;
  margin: 5px;
  border-radius: 2px;
  // minmax(0, 1fr) prevents the editor from growing the text field
  grid-template-columns: minmax(0, 1fr) auto;
  grid-template-areas: 'editor header';
`

export const Header = styled.div`
  grid-area: header;
  border-radius: 4px 4px 0 0;
  display: flex;
  justify-content: flex-end;
  padding-top: 7px;
  margin-right: -5px;
`

export const ActionButtonSection = styled.div`
  display: flex;
  justify-content: space-between;
`

const BaseEditorWrapper = styled.div<ResizeableProps>`
  font-family: 'Fira Code', Monaco, 'Courier New', Terminal, monospace;
  grid-area: editor;

  min-height: ${(props): string => {
    if (props.fullscreen) {
      return '100vh'
    }
    if (props.cardSize) {
      // 230 is 10 lines + 2*12px padding
      return '254px'
    }
    return '0'
  }};

  transition-duration: 0.1s;

  .CodeMirror {
    color: ${(props): string => props.theme.editorCommandColor};
    font-size: 17px;
  }

  .disable-font-ligatures & {
    font-variant-ligatures: none !important;
  }
`
export const AnimationContainer = styled.div<CardSizeProps>`
  padding-top: ${editorPadding}px;
  padding-bottom: ${editorPadding}px;
  position: relative;
  min-height: ${props => (props.cardSize ? '317px' : '112px')};
`

export const Frame = styled.div<FullscreenProps>`
  background-color: ${props => props.theme.secondaryBackground};
  border-radius: 2px;
  padding-bottom: 1px;
  box-shadow: 0px 0px 2px rgba(52, 58, 67, 0.1),
    0px 1px 2px rgba(52, 58, 67, 0.08), 0px 1px 4px rgba(52, 58, 67, 0.08);
  ${(props): string => {
    if (props.fullscreen) {
      return `
  position: fixed;
  top: 0px;
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

export const FrameHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-left: 7px;
  height: 33px;
`

export const UIControls = styled.div`
  align-self: auto;
`

export const FrameHeaderText = styled.div`
  color: white;
  font-family: 'Fira Code', 'Monaco', 'Lucida Console', Courier, monospace;
  font-size: 1.2em;
  line-height: 2.2em;
`

export const EditorWrapper = styled(BaseEditorWrapper)<ResizeableProps>`
  ${(props): string => {
    if (props.fullscreen) {
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
    }
    return ''
  }};
`
