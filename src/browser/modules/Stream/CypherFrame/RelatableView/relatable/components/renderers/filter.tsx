import React from 'react'
import { Form } from 'semantic-ui-react'

import { IFilterFieldProps } from './index'

export default function Filter({ column, onChange }: IFilterFieldProps) {
  if (!column) return null

  const { Filter: ColumnFilter } = column

  return (
    <Form.Field>
      <ColumnFilter column={column} onChange={onChange} />
    </Form.Field>
  )
}
