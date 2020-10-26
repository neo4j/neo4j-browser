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

export const StyledVisContainer = styled.div`
  width: 100%;
  overflow: hidden;
  ${props => (props.fullscreen ? 'padding-bottom: 39px' : null)};
  height: ${props =>
    props.fullscreen
      ? '100vh'
      : dim.frameBodyHeight - dim.frameTitlebarHeight * 2 + 'px'};
  > svg {
    width: 100%;
  }
  > .neod3viz .node .ring {
    fill: none;
    opacity: 0;
    stroke: #6ac6ff;
  }
  > .neod3viz .node.selected .ring {
    stroke: #fdcc59;
  }
  > .neod3viz .node.selected:hover .ring {
    stroke: #6ac6ff;
  }
  > .neod3viz .node:hover .ring,
  > .neod3viz .node.selected .ring {
    opacity: 0.3;
  }
  > .neod3viz .relationship .overlay {
    opacity: 0;
    fill: #6ac6ff;
  }
  > .neod3viz .relationship.selected .overlay {
    fill: #fdcc59;
  }
  > .neod3viz .relationship.selected:hover .overlay {
    fill: #6ac6ff;
  }
  > .neod3viz .relationship:hover .overlay,
  > .neod3viz .relationship.selected .overlay {
    opacity: 0.3;
  }

  > .neod3viz .remove_node,
  .expand_node:hover {
    border: 2px #000 solid;
  }

  > .neod3viz .outline,
  .neod3viz .ring,
  .neod3viz .context-menu-item {
    cursor: pointer;
  }

  > .context-menu-item:hover {
    fill: #b9b9b9;
    font-size: 14px;
  }

  > path.context-menu-item {
    stroke-width: 2px;
    fill: #d2d5da;
  }

  > text.context-menu-item {
    fill: #fff;
    text-anchor: middle;
    pointer-events: none;
    font-size: 14px;
  }
`
