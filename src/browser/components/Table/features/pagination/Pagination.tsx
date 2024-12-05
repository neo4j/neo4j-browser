import { Table } from '@tanstack/react-table'
import { styled } from 'styled-components'

const PaginationWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
`

const Button = styled.button`
  padding: 4px 8px;
  border: 1px solid ${props => props.theme.border};
  background: ${props => props.theme.secondaryBackground};
  cursor: pointer;
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const Select = styled.select`
  padding: 4px;
`

export function Pagination<T>({ table }: { table: Table<T> }) {
  return (
    <PaginationWrapper>
      <Button
        onClick={() => table.setPageIndex(0)}
        disabled={!table.getCanPreviousPage()}
      >
        {'<<'}
      </Button>
      <Button
        onClick={() => table.previousPage()}
        disabled={!table.getCanPreviousPage()}
      >
        {'<'}
      </Button>
      <span>
        Page{' '}
        <strong>
          {table.getState().pagination.pageIndex + 1} of{' '}
          {table.getPageCount()}
        </strong>
      </span>
      <Button
        onClick={() => table.nextPage()}
        disabled={!table.getCanNextPage()}
      >
        {'>'}
      </Button>
      <Button
        onClick={() => table.setPageIndex(table.getPageCount() - 1)}
        disabled={!table.getCanNextPage()}
      >
        {'>>'}
      </Button>
      <Select
        value={table.getState().pagination.pageSize}
        onChange={e => {
          table.setPageSize(Number(e.target.value))
        }}
      >
        {[10, 20, 30, 40, 50].map(pageSize => (
          <option key={pageSize} value={pageSize}>
            Show {pageSize}
          </option>
        ))}
      </Select>
    </PaginationWrapper>
  )
} 