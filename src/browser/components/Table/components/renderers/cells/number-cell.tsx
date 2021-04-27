import React from 'react'

import { CellProps } from '../index'

export default function NumberCell({ cell }: CellProps) {
  const { value = '' } = cell

  return (
    <span className="relatable__table-number-cell relatable__cell-value">
      {Number(value).toLocaleString()}
    </span>
  )
}
