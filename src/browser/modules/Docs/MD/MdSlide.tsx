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
import { StyledSidebarSlide } from 'browser/modules/Carousel/styled'
import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import Slide from '../../Carousel/Slide'
import { splitMdColumns, splitMdRows } from './splitMd'
import { StyledColumn, StyledRow } from './styled'

type RowProps = { row: string }
const MdRow = ({ row = '' }: RowProps) => (
  <StyledRow>
    {splitMdColumns(row).map((column, index) => (
      <StyledColumn key={index}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            pre({
              className,
              children,
              ...props
            }: React.DetailedHTMLProps<
              React.HTMLAttributes<HTMLPreElement>,
              HTMLPreElement
            >) {
              const isCypherCodeBlock =
                Array.isArray(children) &&
                children[0]?.props?.className?.includes('cypher')
              return (
                <pre
                  className={
                    (className ?? '') +
                    (isCypherCodeBlock ? ' code runnable' : '')
                  }
                  {...props}
                >
                  {children}
                </pre>
              )
            }
          }}
        >
          {column ?? ''}
        </ReactMarkdown>
      </StyledColumn>
    ))}
  </StyledRow>
)

type MdSlideProps = { md: string; isSidebarSlide?: boolean }
const MdSlide = ({
  md = '',
  isSidebarSlide = false
}: MdSlideProps): JSX.Element => (
  <Slide isSidebarSlide={isSidebarSlide}>
    <StyledSidebarSlide>
      {splitMdRows(md).map((row, index) => (
        <MdRow key={index} row={row} />
      ))}
    </StyledSidebarSlide>
  </Slide>
)

export default MdSlide
