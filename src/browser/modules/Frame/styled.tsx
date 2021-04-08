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
import { dim } from 'browser-styles/constants'

type FullscreenProps = { fullscreen: boolean }

export const StyledFrame = styled.article<FullscreenProps>`
  width: auto;
  background-color: ${props => props.theme.secondaryBackground};
  border: ${props => props.theme.frameBorder};

  ${props =>
    props.fullscreen
      ? `margin: 0;
position: fixed;
left: 0;
top: 0;
bottom: 0;
right: 0;
z-index: 130;`
      : 'margin 0 0 10px 0;'}

  &:hover .carousel-intro-animation {
    opacity: 0;
  }
  box-shadow: 0px 0px 2px rgba(52, 58, 67, 0.1),
    0px 1px 2px rgba(52, 58, 67, 0.08), 0px 1px 4px rgba(52, 58, 67, 0.08);
  border-radius: 2px;
`

export const StyledFrameBody = styled.div<{
  removePadding?: boolean
  hasSlides?: boolean
}>`
  overflow: auto;
  min-height: ${dim.frameBodyHeight / 2}px;
  max-height: 100%;
  display: flex;
  flex-direction: row;
  width: 100%;
  padding: 30px;

  ${props =>
    props.hasSlides
      ? `
    position: relative;
    padding-bottom: 40px;
    padding-left: 40px;
    padding-right: 40px;`
      : ''}

  ${props => (props.removePadding ? 'padding: 0;' : '')}
`

export const StyledFrameMainSection = styled.div`
  min-width: 0;
  flex: 1 1 auto;
  height: inherit;
  display: flex;
  flex-direction: column;
  width: 100%;
`

export const StyledFrameAside = styled.div`
  flex: 0 0 20%;
  padding: 0 15px;
  width: 25%;
  font-family: ${props => props.theme.primaryFontFamily};
  font-size: 16px;
  font-weight: 300;
  color: ${props => props.theme.asideText};
  min-width: 120px;
`

export const StyledFrameContents = styled.div`
  font-size: 14px;
  overflow: auto;
  min-height: ${dim.frameBodyHeight / 2}px;
  max-height: 100%;
  flex: 1 1 auto;
  display: flex;
  width: 100%;
  height: 100%;

  .has-carousel & {
    overflow: visible;
  }

  p {
    margin: 0 0 20px 0;
  }
`

export const StyledFrameStatusbar = styled.div`
  border-top: ${props => props.theme.inFrameBorder};
  height: ${dim.frameStatusbarHeight - 1}px;
  display: flex;
  flex-direction: row;
  flex: none;
  align-items: center;
  padding-left: 0px;

  .statusbar--success {
    color: ${props => props.theme.success};
  }
`

export const StyledFrameSidebar = styled.ul`
  line-height: 33px;
  width: 45px;
  margin-left: -5px;
  list-style: none;
  padding-left: 0;
  margin: 0;
  flex: 0 0 auto;
  background-color: ${props => props.theme.frameSidebarBackground};
`

export const StyledFrameTitlebarButtonSection = styled.ul`
  flex: 0 0 auto;
  display: flex;
  margin-left: -5px;
  list-style: none;
  padding-left: 0;
  margin: 0;
  margin-left: auto;
  color: ${props => props.theme.secondaryButtonText};
`

export const StyledFrameTitleBar = styled.div`
  border-bottom: transparent;
  line-height: ${dim.frameTitlebarHeight}px;
  color: ${props => props.theme.frameTitlebarText};
  display: flex;
`

export const StyledFrameStatusbarText = styled.label`
  flex: 1 1 auto;
`

export const CurrentDbText = styled.div`
  color: ${props => props.theme.promptText};
`

export const FrameTitleEditorContainer = styled.div`
  border-radius: 2px;
  padding-left: 6px;
  padding-top: 3px;
  margin: 3px 5px 3px 3px;

  width: 0; // Prevents the editor from growing past flex-grow: 1
  flex-grow: 1;
  display: flex;

  font-family: ${props => props.theme.editorFont};
  line-height: 2.2em;
  font-size: 1.2em;
  color: ${props => props.theme.secondaryButtonText};
  background-color: ${props => props.theme.frameSidebarBackground};
  .disable-font-ligatures & {
    font-variant-ligatures: none !important;
  }
`

export const StyledFrameCommand = styled.label<{ selectedDb: string | null }>`
  font-family: ${props => props.theme.editorFont};
  color: ${props => props.theme.secondaryButtonText};
  background-color: ${props => props.theme.frameSidebarBackground};
  border-radius: 2px;
  padding-left: 6px;
  font-size: 1.2em;
  line-height: 2.2em;
  margin: 3px 5px 3px 3px;
  flex: 1 1 auto;
  min-width: 0;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  display: block;
  &::before {
    color: ${props => props.theme.promptText};
    content: "${props => (props.selectedDb || '') + '$ '}";
  }
  .disable-font-ligatures & {
    font-variant-ligatures: none !important;
  } 
`
