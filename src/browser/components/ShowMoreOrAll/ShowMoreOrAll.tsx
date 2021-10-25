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
import { StyledShowMoreLink } from './styled'

type ShowMoreOrAllProps = {
  total: number
  shown: number
  moreStep: number
  onMore: (num: number) => any
}
export const ShowMoreOrAll = ({
  total,
  shown,
  moreStep,
  onMore
}: ShowMoreOrAllProps) => {
  const numMore = total - shown > moreStep ? moreStep : total - shown
  return shown < total ? (
    <div>
      <StyledShowMoreLink onClick={() => onMore(numMore)}>
        Show {numMore} more
      </StyledShowMoreLink>
      &nbsp;|&nbsp;
      <StyledShowMoreLink onClick={() => onMore(total)}>
        Show all
      </StyledShowMoreLink>
    </div>
  ) : null
}
