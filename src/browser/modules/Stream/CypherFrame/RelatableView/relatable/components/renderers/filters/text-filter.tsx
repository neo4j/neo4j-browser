import React from 'react'
import { FormInput } from 'semantic-ui-react'

import { IFilterFieldProps } from '../index'

export default function TextFilter({
  column: { Header },
  onChange
}: IFilterFieldProps) {
  return (
    <FormInput
      input={{ autoFocus: true }}
      onChange={({ target }) => onChange(target.value || undefined)}
      placeholder={`Filter ${Header}...`}
    />
  )
}
