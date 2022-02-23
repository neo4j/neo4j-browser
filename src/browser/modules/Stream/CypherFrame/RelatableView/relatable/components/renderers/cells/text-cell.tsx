import React from 'react'

import { ICellProps } from '../index'

export default function TextCell({ cell }: ICellProps) {
  const { value = '' } = cell

  return (
    <span className="relatable__table-text-cell relatable__cell-value">
      {String(value)}
    </span>
  )
}
