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

export const StyledFileDrop = styled.div``

export const StyledFileDropInner = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
  opacity: 0;
  overflow: hidden;
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  pointer-events: none;

  .has-file-hovering & {
    color: #fff;
    background-color: rgba(0, 0, 0, 0.6);
    opacity: 1;
    transition: opacity 0.2s ease-in-out;
    z-index: 1000;
  }

  .has-user-select & {
    pointer-events: all;
  }
`

export const StyledFileDropContent = styled.div`
  position: relative;
`

export const StyledFileDropActions = styled.div`
  display: block;
  visibility: hidden;
  position: absolute;
  left: 50%;
  top: calc(100% + 1rem);
  transform: translateX(-50%);
  width: 100vw;
  text-align: center;
  pointer-events: none;

  .has-user-select & {
    visibility: visible;
    pointer-events: all;
  }
`

export const StyledFileDropActionButton = styled.button`
  border: 0;
  border-radius: 5px;
  color: #000;
  background-color: #fff;
  padding: 5px 10px;
  font-weight: 600;
  margin: 0 5px;
`
