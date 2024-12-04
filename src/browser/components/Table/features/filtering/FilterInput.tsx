import { Column } from '@tanstack/react-table'
import { styled } from 'styled-components'

const Input = styled.input`
  padding: 4px 8px;
  border: 1px solid ${props => props.theme.border};
  border-radius: 4px;
  margin-top: 4px;
  width: 100%;
`

export function FilterInput<T>({ column }: { column: Column<T> }) {
  const columnFilterValue = column.getFilterValue()

  return (
    <Input
      value={(columnFilterValue ?? '') as string}
      onChange={e => column.setFilterValue(e.target.value)}
      placeholder={`Filter ${column.id}...`}
      className="h-8 w-full rounded border shadow"
    />
  )
} 