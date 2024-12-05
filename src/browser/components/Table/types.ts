import { 
  ColumnDef, 
  Row, 
  Table,
  TableState as TanstackTableState,
  SortingState,
  OnChangeFn
} from '@tanstack/react-table'

export interface TableOptions<T> {
  data: T[]
  columns: ColumnDef<T>[]
  enableSorting?: boolean
  enableFiltering?: boolean
  enablePagination?: boolean
  enableSelection?: boolean
  onSelectionChange?: (rows: Row<T>[]) => void
  onSortingChange?: OnChangeFn<SortingState>
  onFilterChange?: (columnId: string, value: any) => void
}

export interface TableState extends TanstackTableState {
  sorting: {
    id: string
    desc: boolean
  }[]
  columnFilters: {
    id: string
    value: any
  }[]
  pagination: {
    pageIndex: number
    pageSize: number
  }
  rowSelection: Record<string, boolean>
}

export type TableInstance<T> = Table<T> 