/*
 * Copyright (c) "Neo4j"
 * Neo4j Sweden AB [http://neo4j.com]
 * This file is part of Neo4j.
 * Neo4j is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 */
import styled from 'styled-components'

export const RelatableStyleWrapper = styled.div`
  width: 100%;
  /* semantic ui specificity... */
  .relatable__table-row,
  .relatable__table-row.relatable__table-header-row
    .relatable__table-header-cell {
    background-color: ${props => props.theme.frameBackground};
    color: ${props => props.theme.secondaryText};
  }
  .relatable__table-row-number {
    color: ${props => props.theme.preText};
    background-color: ${props => props.theme.preBackground};
  }
  .relatable__table-header-row .relatable__table-cell {
    border-bottom: ${props => props.theme.inFrameBorder};
  }
  .relatable__table-body-row .relatable__table-cell {
    border-top: ${props => props.theme.inFrameBorder};
    vertical-align: top;
  }
`

export const StyledJsonPre = styled.pre`
  background-color: ${props => props.theme.preBackground};
  border-radius: 5px;
  margin: 0px 10px;
  border-bottom: none;
  color: ${props => props.theme.preText};
  line-height: 26px;
  padding: 2px 10px;
  max-width: 100%;
  white-space: pre-wrap;
  position: relative;
`

export const StyledPreSpan = styled.span`
  white-space: pre;
`
export const CopyIconAbsolutePositioner = styled.span`
  position: absolute;
  right: 10px;
  top: 4px;
`
