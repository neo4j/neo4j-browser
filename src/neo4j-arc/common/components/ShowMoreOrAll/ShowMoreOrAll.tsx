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

import { StyledShowMoreButton } from './styled'

type ShowMoreOrAllProps = {
  total: number
  shown: number
  moreStep: number
  onMore: (num: number) => void
}
export const ShowMoreOrAll = ({
  total,
  shown,
  moreStep,
  onMore
}: ShowMoreOrAllProps) => {
  const numMore = Math.min(moreStep, total - shown)
  return shown < total ? (
    <div>
      <StyledShowMoreButton onClick={() => onMore(numMore)}>
        {`Show ${numMore} more`}
      </StyledShowMoreButton>
      &nbsp;|&nbsp;
      <StyledShowMoreButton onClick={() => onMore(total)}>
        {`Show all`}
      </StyledShowMoreButton>
    </div>
  ) : null
}
