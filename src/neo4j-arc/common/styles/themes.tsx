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
import { ThemeProvider } from 'styled-components'
import React from 'react'

export const baseArcTheme = {
  name: 'base',
  // Text colors
  primaryText: '#333',
  link: '#428BCA',

  // Backgrounds
  primaryBackground: '#D2D5DA',
  editorBackground: '#fff',
  alteringTableRowBackground: '#f5f5f5',

  // Fonts
  primaryFontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
  drawerHeaderFontFamily:
    "'Open Sans', 'HelveticaNeue-Light', 'Helvetica Neue Light', 'Helvetica Neue', Helvetica, Arial, sans-serif",

  // Shadows
  standardShadow:
    '0px 0px 2px rgba(52, 58, 67, 0.1), 0px 1px 2px rgba(52, 58, 67, 0.08), 0px 1px 4px rgba(52, 58, 67, 0.08);',

  // Borders
  inFrameBorder: '1px solid #DAE4F0;',

  // Frame
  frameSidebarBackground: '#FFF',
  frameControlButtonTextColor: '#485662',
  frameButtonTextColor: '#717780',
  frameButtonHoverBackground: 'rgba(113,119,128,0.1)',
  frameButtonActiveBackground: 'rgba(113,119,128,0.2)',
  frameNodePropertiesPanelIconTextColor: '#717172',
  frameBackground: '#F9FCFF',

  // Info message
  infoBackground: '#e6f8ff',
  infoBorder: '1px solid #7ad1ff',
  infoIconColor: '#006FD6'
}

export const light = {
  ...baseArcTheme,
  name: 'LIGHT'
}

/**
 * Get Theme provider for Arc components, default is LIGHT theme
 * @param children
 * @param theme if provided used as theme instead of default LIGHT
 * @constructor
 */
export const ArcThemeProvider = ({
  children,
  theme
}: {
  children: JSX.Element
  theme?: typeof baseArcTheme
}) => <ThemeProvider theme={theme ?? light}>{children}</ThemeProvider>
