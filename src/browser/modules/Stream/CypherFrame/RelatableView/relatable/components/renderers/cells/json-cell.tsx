import React from 'react'

import { ICellProps } from '../index'

export default function JSONCell({ cell }: ICellProps) {
  const { value = '' } = cell

  return (
    <pre className="relatable__table-json-cell relatable__cell-value">
      <code>{JSON.stringify(value, null, 2)}</code>
    </pre>
  )
}
