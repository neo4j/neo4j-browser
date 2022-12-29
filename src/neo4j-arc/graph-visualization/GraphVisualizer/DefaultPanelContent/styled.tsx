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

import { StyledLabelChip, StyledRelationshipChip } from 'neo4j-arc/common'

export const legendRowHeight = 32

export const StyledInlineList = styled.ul`
  list-style: none;
  word-break: break-word;
`

export const StyledLegendInlineList = styled(StyledInlineList)`
  padding: 4px 0 0 0;
  &.contracted {
    max-height: ${legendRowHeight}px;
    overflow: hidden;
  }
`

export const NonClickableLabelChip = styled(StyledLabelChip)`
  cursor: default;
`

export const NonClickableRelTypeChip = styled(StyledRelationshipChip)`
  cursor: default;
`

export const PaneWrapper = styled.div`
  padding: 0 14px;
  height: 100%;
  display: flex;
  flex-direction: column;
`

export const PaneHeader = styled.div`
  font-size: 16px;
  margin-top: 10px;
  flex: 0 0 auto;
  overflow: auto;
  max-height: 50%;
`

export const PaneBody = styled.div`
  height: 100%;
  overflow: auto;
  margin: 14px 0;
  flex: 0 1 auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
`

export const PaneBodySectionTitle = styled.span`
  font-weight: 700;
`

export const PaneBodySectionSmallText = styled.span`
  font-size: 0.9rem;
`
export const PaneBodySectionHeaderWrapper = styled.div`
  display: flex;
  flex-direction: column;
`

export const PaneTitle = styled.div`
  margin-bottom: 10px;
  display: flex;
  gap: 5px;
  align-items: center;
`
