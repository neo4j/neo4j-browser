import React from 'react'

import { CellProps } from '../index'

export default function ValueAggregate({ cell: { value } }: CellProps) {
  return <span className="relatable__table-aggregate-cell">{value} Values</span>
}
