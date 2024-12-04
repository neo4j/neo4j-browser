import { flexRender } from '@tanstack/react-table'
import { TableInstance } from '../types'
import { styled } from 'styled-components'
import { SortingHeader } from '../features/sorting/SortingHeader'
import { FilterInput } from '../features/filtering/FilterInput'
import { Pagination } from '../features/pagination/Pagination'
import { SelectionCell } from '../features/selection/SelectionCell'
import { Checkbox } from '../features/selection/SelectionCell'

const TableWrapper = styled.div`
  overflow: auto;
  border: 1px solid ${props => props.theme.border};
`

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`

const Th = styled.th`
  padding: 12px;
  text-align: left;
  border-bottom: 2px solid ${props => props.theme.border};
  background: ${props => props.theme.secondaryBackground};
`

const Td = styled.td`
  padding: 12px;
  border-bottom: 1px solid ${props => props.theme.border};
`

export function Table<T extends Record<string, any>>({ 
  instance,
  enableSorting,
  enableFiltering,
  enablePagination,
  enableSelection 
}: { 
  instance: TableInstance<T>
  enableSorting?: boolean
  enableFiltering?: boolean
  enablePagination?: boolean
  enableSelection?: boolean
}) {
  return (
    <TableWrapper>
      <StyledTable>
        <thead>
          {instance.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {enableSelection && (
                <Th>
                  <Checkbox
                    type="checkbox"
                    checked={instance.getIsAllRowsSelected()}
                    onChange={instance.getToggleAllRowsSelectedHandler()}
                  />
                </Th>
              )}
              {headerGroup.headers.map(header => (
                <Th key={header.id}>
                  {enableSorting && header.column.getCanSort() ? (
                    <SortingHeader column={header.column} />
                  ) : (
                    flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )
                  )}
                  {enableFiltering && header.column.getCanFilter() && (
                    <FilterInput column={header.column} />
                  )}
                </Th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {instance.getRowModel().rows.map(row => (
            <tr key={row.id}>
              {enableSelection && (
                <Td>
                  <SelectionCell row={row} />
                </Td>
              )}
              {row.getVisibleCells().map(cell => (
                <Td key={cell.id}>
                  {flexRender(
                    cell.column.columnDef.cell,
                    cell.getContext()
                  )}
                </Td>
              ))}
            </tr>
          ))}
        </tbody>
      </StyledTable>
      {enablePagination && <Pagination table={instance} />}
    </TableWrapper>
  )
} 