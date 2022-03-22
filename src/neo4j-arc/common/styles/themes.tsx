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
import { palette as needlePalette } from '@neo4j-ndl/base/lib/tokens/js/tokens'
import { ThemeProvider } from 'styled-components'
import React from 'react'

// Currently hard code values for svgs, to be replaced with proper theme colors from NDL
export const stopIconColor = '#FD766E'
export const primaryLightColor = '#68BDF4'

export const light = {
  name: 'LIGHT',
  // Text colors
  primaryText: '#333',
  secondaryText: '#717172',
  inputText: '#222',
  headerText: '#333',
  asideText: '#292C33',
  link: '#428BCA',
  linkHover: '#5dade2',
  topicText: '#428BCA',
  preText: '#333',
  promptText: '#c0c2c5',
  neo4jBlue: '#018BFF',
  darkBlue: '#0056B3',

  // Design system colors
  primary: '#018BFF',
  primary50: '#0070d9',

  // Backgrounds
  primaryBackground: '#D2D5DA',
  secondaryBackground: '#fff',
  editorBackground: '#fff',
  drawerBackground: '#30333a',
  topicBackground: '#f8f8f8',
  preBackground: '#f5f5f5',
  alteringTableRowBackground: '#f5f5f5',
  frameCommandBackground: '#F8F9FB',
  runnableBackground: '#f5f5f5',
  teaserCardBackground: '#fff',
  hoverBackground: '#40444e',

  // Fonts
  primaryFontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
  drawerHeaderFontFamily:
    "'Open Sans', 'HelveticaNeue-Light', 'Helvetica Neue Light', 'Helvetica Neue', Helvetica, Arial, sans-serif",
  streamlineFontFamily: 'streamline',
  editorFont:
    '"Fira Code", "Monaco", "Lucida Console", Courier, monospace !important;',
  codeBlockFont: '"Fira Code", "Monaco", "Lucida Console", Courier, monospace',

  // Shadows
  standardShadow:
    '0px 0px 2px rgba(52, 58, 67, 0.1), 0px 1px 2px rgba(52, 58, 67, 0.08), 0px 1px 4px rgba(52, 58, 67, 0.08);',

  // Headers
  primaryHeaderText: '#fff',

  // User feedback colors
  success: '#65B144',
  error: '#E74C3C',
  warning: '#ffaf00',
  auth: '#428BCA',
  info: '#428BCA',

  // Buttons
  primaryButtonText: '#fff',
  primaryButtonBackground: '#428BCA',
  secondaryButtonText: '#888',
  secondaryButtonBorder: '1px solid #888',
  secondaryButtonBackground: 'transparent',
  secondaryButtonTextHover: '#fff',
  secondaryButtonBorderHover: '1px solid #888',
  secondaryButtonBackgroundHover: '#888',
  formButtonBorder: '1px solid #ccc',
  formButtonBorderHover: '1px solid ##adadad',
  formButtonBackgroundHover: '#e6e6e6',
  editModeButtonText: '#ffaf00',

  // Borders
  frameBorder: 'none',
  inFrameBorder: '1px solid #DAE4F0;',
  topicBorder: '1px solid #dadada',
  drawerSeparator: '1px solid #424650',
  monacoEditorBorder: '1px solid #d7e5f1',

  // Frame
  frameSidebarBackground: '#FFF',
  frameTitlebarText: '#717172',
  frameControlButtonTextColor: '#485662',
  frameButtonTextColorLegacy: '#0C1A25',
  frameButtonTextColor: needlePalette.light.neutral.text.weaker,
  frameButtonHoverBackground: needlePalette.light.neutral.hover,
  frameButtonActiveBackground: needlePalette.light.neutral.pressed,
  frameNodePropertiesPanelIconTextColor: '#717172',
  streamBackgroundColor: 'rgba(215, 229, 241, 0.7)',
  frameBackground: '#F9FCFF',
  accordionContentBackground: 'white',
  currentEditIconColor: '#6B6B6B',

  // Info message
  infoBackground: needlePalette.light.primary.bg.weak,
  infoBorder: `1px solid ${needlePalette.light.primary.border.weak}`,
  infoIconColor: needlePalette.light.primary.icon,

  // Code block
  codeBlockBackground: '#f5f5f5',
  codeBlockTextColor: needlePalette.light.primary.text,
  codeBlockHoveBackground: needlePalette.light.primary.hover.weak
}

export const LightThemeProvider = ({ children }: { children: JSX.Element }) => (
  <ThemeProvider theme={light}>{children}</ThemeProvider>
)
