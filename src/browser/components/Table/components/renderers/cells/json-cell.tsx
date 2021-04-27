import React from 'react'

import { CellProps } from '../index'

export default function JSONCell({ cell }: CellProps) {
  const { value = '' } = cell

  return (
    <pre className="relatable__table-json-cell relatable__cell-value">
      <code>{JSON.stringify(value, null, 2)}</code>
    </pre>
  )
}
