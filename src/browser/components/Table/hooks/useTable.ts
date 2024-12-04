import {
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getGroupedRowModel,
  ColumnDef,
  Table,
  SortingState,
  ColumnFiltersState,
  PaginationState
} from '@tanstack/react-table'
import { useState } from 'react'

export function useTableFeatures<T extends Record<string, any>>(
  data: T[],
  columns: ColumnDef<T>[],
  options: {
    enableSorting?: boolean
    enableFiltering?: boolean
    enablePagination?: boolean
    enableGrouping?: boolean
    initialPageSize?: number
  } = {}
): Table<T> {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: options.initialPageSize || 10
  })

  return useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      pagination
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: options.enableSorting ? getSortedRowModel() : undefined,
    getFilteredRowModel: options.enableFiltering ? getFilteredRowModel() : undefined,
    getPaginationRowModel: options.enablePagination ? getPaginationRowModel() : undefined,
    getGroupedRowModel: options.enableGrouping ? getGroupedRowModel() : undefined
  })
} 