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

export const Drawer = styled.div`
  width: 285px;
  display: flex;
  flex-direction: column;
  height: 100vh;
`

export const DrawerHeader = styled.h4`
  color: ${props => props.theme.primaryHeaderText};
  background-color: ${props => props.theme.drawerBackground};
  font-size: 18px;
  height: 73px;
  padding: 25px 0 0 25px;
  position: relative;
  font-weight: bold;
  -webkit-font-smoothing: antialiased;
  text-shadow: rgba(0, 0, 0, 0.4) 0px 1px 0px;
  font-family: ${props => props.theme.drawerHeaderFontFamily};
`

export const DrawerToppedHeader = styled(DrawerHeader)`
  padding-top: 8px;
`

export const DrawerSubHeader = styled.h5`
  color: ${props => props.theme.primaryHeaderText};
  border-bottom: 1px solid #424650;
  font-size: 14px;
  margin-bottom: 12px;
  line-height: 39px;
  position: relative;
  font-weight: bold;
  -webkit-font-smoothing: antialiased;
  text-shadow: rgba(0, 0, 0, 0.4) 0px 1px 0px;
  font-family: ${props => props.theme.drawerHeaderFontFamily};
`

export const DrawerSection = styled.div`
  margin-bottom: 12px;
`

export const DrawerSectionBody = styled.div`
  font-family: ${props => props.theme.primaryFontFamily};
  font-weight: normal;
  color: #bcc0c9;
`

export const DrawerBody = styled.div`
  padding: 0 24px;
  flex: 1;
`

export const DrawerFooter = styled.div`
  margin-bottom: 20px;
  text-align: center;
`
