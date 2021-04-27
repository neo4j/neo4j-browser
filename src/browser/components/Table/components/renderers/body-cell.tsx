import React from 'react'
import { Table as SemanticTable } from 'semantic-ui-react'

import { CellProps } from './index'

export default function BodyCell({
  cell,
  getCellColSpan,
  ...cellProps
}: CellProps) {
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
