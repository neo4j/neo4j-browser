import React from 'react'

import { ICellProps } from '../index'

export default function DateCell({ cell }: ICellProps) {
  const { value = '' } = cell

  return (
    <span className="relatable__table-date-cell relatable__cell-value">
      {new Date(value).toLocaleString()}
    </span>
  )
}
