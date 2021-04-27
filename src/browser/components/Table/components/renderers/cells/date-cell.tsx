import React from 'react'

import { CellProps } from '../index'

export default function DateCell({ cell }: CellProps) {
  const { value = '' } = cell

  return (
    <span className="relatable__table-date-cell relatable__cell-value">
      {new Date(value).toLocaleString()}
    </span>
  )
}
