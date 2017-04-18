/*
 * Copyright (c) 2002-2017 "Neo Technology,"
 * Network Engine for Objects in Lund AB [http://neotechnology.com]
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

export const base = {
  // Text colors
  primaryText: '#333',
  secondaryText: '#fff',
  headerText: '#333',
  asideText: '#666',
  link: '#428BCA',
  linkHover: '#5dade2',

  // Backgrounds
  primaryBackground: '#eee',
  secondaryBackground: '#fff',
  editorBarBackground: '#EFEFF4',
  drawerBackground: '#30333a',

  // Fonts
  primaryFontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
  drawerHeaderFontFamily: "'Open Sans', 'HelveticaNeue-Light', 'Helvetica Neue Light', 'Helvetica Neue', Helvetica, Arial, sans-serif",
  streamlineFontFamily: 'streamline',
  editorFont: '"Inconsolata", "Monaco", "Lucida Console", Courier, monospace;',
  // Headers
  primaryHeaderText: '#fff',

  // User feedback colors
  success: '#70E9B1',
  error: '#E74C3C',
  warning: '#FD952C',
  auth: '#428BCA',

  // Buttons
  primaryButtonText: '',
  primaryButtonBackground: '',
  secondaryButtonText: '#717172',
  secondaryButtonBorder: '1px solid #717172',
  secondaryButtonBackground: 'transparent',
  secondaryButtonTextHover: '#40454F',
  secondaryButtonBorderHover: '1px solid #717172',
  secondaryButtonBackgroundHover: '#717172',
  formButtonBorder: '1px solid #ccc',
  formButtonBorderHover: '1px solid ##adadad',
  formButtonBackgroundHover: '#e6e6e6',

  // Frame
  frameBorder: 'none',
  inFrameBorder: '1px solid #e6e9ef',
  frameSidebarBackground: '#F8F9FB',
  frameTitlebarText: '#717172'
}

export const normal = {
  ...base
}

export const outline = {
  ...base,
  primaryText: '#000',
  secondaryText: '#000',
  frameBorder: '1px solid #000',
  inFrameBorder: '1px solid #000'
}
