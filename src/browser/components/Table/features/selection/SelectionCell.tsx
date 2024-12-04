import { Row } from '@tanstack/react-table'
import { styled } from 'styled-components'

export const Checkbox = styled.input`
  margin: 0;
`

export function SelectionCell<T>({ row }: { row: Row<T> }) {
  return (
    <Checkbox
      type="checkbox"
      checked={row.getIsSelected()}
      onChange={row.getToggleSelectedHandler()}
    />
  )
} 