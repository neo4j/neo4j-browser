import { Column } from '@tanstack/react-table'
import { styled } from 'styled-components'

const SortIcon = styled.span<{ $direction: 'asc' | 'desc' | false }>`
  margin-left: 4px;
  &::after {
    content: "${props => props.$direction === 'asc' ? '↑' : '↓'}";
  }
`

export function SortingHeader<T>({ column }: { column: Column<T> }) {
  return (
    <div 
      style={{ cursor: 'pointer' }}
      onClick={() => column.toggleSorting()}
    >
      {typeof column.columnDef.header === 'string' 
        ? column.columnDef.header 
        : column.id}
      {column.getIsSorted() && (
        <SortIcon $direction={column.getIsSorted()} />
      )}
    </div>
  )
} 