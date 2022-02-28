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
import React from 'react'
import { Table as SemanticTable } from 'semantic-ui-react'

import { ICellProps } from './index'

export default function BodyCell({
  cell,
  getCellColSpan,
  ...cellProps
}: ICellProps) {
  const { render, row } = cell
  const colSpan = getCellColSpan(cell)

  if (colSpan === 0) return null

  return (
    <SemanticTable.Cell
      {...cellProps}
      colSpan={colSpan}
      className="relatable__table-cell relatable__table-body-cell"
    >
      {(!row.isAggregated || cell.isGrouped) && render('Cell')}
      {row.isAggregated && !cell.isGrouped && render('Aggregated')}
    </SemanticTable.Cell>
  )
}
