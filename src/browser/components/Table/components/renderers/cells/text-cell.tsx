import React from 'react'

import { CellProps } from '../index'

export default function TextCell({ cell }: CellProps) {
  const { value = '' } = cell

  return (
    <span className="relatable__table-text-cell relatable__cell-value">
      {String(value)}
    </span>
  )
}
