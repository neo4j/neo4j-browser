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

import React from 'react'
import {
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerBrowserCommand
} from 'browser-components/drawer'
import styled from 'styled-components'
const sidebarGuides = [
  'intro',
  'concepts',
  'cypher',
  'movie-graph',
  'northwind-graph'
]

const StyledMessage = styled.div``
const GuideContent = styled.div``

function GuideDrawer(): JSX.Element {
  return (
    <Drawer id="guide-drawer">
      <DrawerHeader>Neo4j Browser Guides</DrawerHeader>
      <DrawerBody>
        <div>dropdown goes here</div>
        <GuideContent> guide goes here </GuideContent>
        <StyledMessage>
          You can also access Browser guides by running
          <DrawerBrowserCommand> :play {'<guide_name>'} </DrawerBrowserCommand>
          in the main editor
        </StyledMessage>
      </DrawerBody>
    </Drawer>
  )
}

export default GuideDrawer
