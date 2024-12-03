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

export const Code = styled.code`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #fd766e;
  background-color: ${props => props.theme.frameSidebarBackground};
  border-radius: 2px;
  padding: 4px;
  display: block;
  width: 100%;
  font-size: 12px;

  a {
    color: #c7254e !important;
  }
`
export const StyledTableWrapper = styled.div`
  margin: 20px 10px;
`
export const StyledTable = styled.table`
  width: 100%;
  table-layout: fixed;
`
export const StyledTh = styled.th<{ width?: string }>`
  text-align: left;
  height: 30px;
  vertical-align: top;
  padding: 5px;
  width: ${props => props.width || 'auto'};
`
export const StyledTd = styled.td<{ width?: string }>`
  padding: 5px;
  width: ${props => props.width || 'auto'};
  text-overflow: ellipsis;
  overflow: hidden;
`
export const StyledHeaderRow = styled.tr`
  border-top: ${props => props.theme.inFrameBorder};
  border-bottom: ${props => props.theme.inFrameBorder};
`
export const VirtualTableBody = styled.div`
  height: 400px;
  overflow: auto;
  border: ${props => props.theme.inFrameBorder};
  border-top: none;
  background: ${props => props.theme.frameBackground};
  
  &::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${props => props.theme.frameSidebarBackground};
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme.secondaryButtonBackground};
    border-radius: 5px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: ${props => props.theme.primaryButtonBackground};
  }
`

export const VirtualRow = styled.div<{ isEven: boolean }>`
  display: flex;
  padding: 12px 8px;
  border-bottom: ${props => props.theme.inFrameBorder};
  background-color: ${props => props.isEven ? props.theme.frameBackground : props.theme.frameSidebarBackground};
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: ${props => props.theme.primaryButtonBackground}20;
  }
`

export const VirtualCell = styled.div<{ width: string }>`
  width: ${props => props.width};
  padding-right: 8px;
  overflow: hidden;
`

export const MetaInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`
