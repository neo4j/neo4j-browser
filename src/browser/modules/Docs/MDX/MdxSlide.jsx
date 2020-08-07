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

import MDX from '@mdx-js/runtime'
import React from 'react'
import Slide from '../../Carousel/Slide'
import { MdxErrorBoundary } from './MdxErrorBoundary'
import { splitMdxColumns, splitMdxRows } from './splitMdx'
import { StyledColumn, StyledRow, StyledSlide } from './styled'
import { validateJSX } from './validateJSX'

const MdxColumn = ({ column: mdx = '' }) => {
  // Provide components that should be available in MDX guides
  const components = {}
  // Provide variables that should be available in MDX guides
  const scope = {}

  return (
    <StyledColumn>
      <MdxErrorBoundary>
        <MDX
          components={components}
          scope={scope}
          rehypePlugins={[validateJSX]}
        >
          {mdx}
        </MDX>
      </MdxErrorBoundary>
    </StyledColumn>
  )
}

const MdxRow = ({ row = '' }) => (
  <StyledRow>
    {splitMdxColumns(row).map((column, index) => (
      <MdxColumn key={index} column={column} />
    ))}
  </StyledRow>
)

const MdxSlide = ({ mdx = '' }) => (
  <Slide>
    <StyledSlide>
      {splitMdxRows(mdx).map((row, index) => (
        <MdxRow key={index} row={row} />
      ))}
    </StyledSlide>
  </Slide>
)

export default MdxSlide
