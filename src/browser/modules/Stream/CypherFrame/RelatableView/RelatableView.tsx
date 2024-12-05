import { ColumnDef } from '@tanstack/react-table'
import { Table } from 'browser/components/Table/components/Table'
import { useTableFeatures } from 'browser/components/Table/hooks/useTable'

export function RelatableView<T extends Record<string, any>>({ 
  data,
  columns 
}: { 
  data: T[]
  columns: ColumnDef<T>[]
}) {
  const table = useTableFeatures(data, columns, {
    enableSorting: true,
    enableFiltering: true,
    enablePagination: true,
    initialPageSize: 20
  })

  return (
    <Table
      instance={table}
      enableSorting
      enableFiltering
      enablePagination
    />
  )
} 