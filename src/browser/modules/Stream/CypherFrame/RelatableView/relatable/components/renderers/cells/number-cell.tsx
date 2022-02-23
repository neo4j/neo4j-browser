import React from 'react'

import { ICellProps } from '../index'

export default function NumberCell({ cell }: ICellProps) {
  const { value = '' } = cell

  return (
    <span className="relatable__table-number-cell relatable__cell-value">
      {Number(value).toLocaleString()}
    </span>
  )
}
