/*
 * Copyright (c) "Neo4j"
 * Neo4j Sweden AB [http://neo4j.com]
 * This file is part of Neo4j.
 * Neo4j is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 */
/**
 * Internal types
 */
import {
  Cell,
  Column,
  ColumnInstance,
  PluginHook,
  Row,
  TableInstance,
  TableOptions,
  UseExpandedRowProps,
  UseFiltersColumnProps,
  UseGroupByColumnProps,
  UseSortByColumnProps
} from 'react-table'

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>
export type TableStateDefault = { [key: string]: any } // @todo: better typings
export type TableParamFactory<
  Data extends object = any,
  IInstance extends IRelatableStateInstance<Data> = any
> = (params: TableOptions<Data>) => IInstance
export type TableStateFactory = (state: TableStateDefault) => TableStateDefault
export type AddOnPredicate = (columnOrRow: any) => boolean
export type GlobalActionName = string | null
export type TableActionName = string | null
export type TableAddOnReturn<Data extends object = any> = [
  GlobalActionName,
  TableActionName,
  AddOnPredicate,
  TableParamFactory<Data>,
  TableStateFactory,
  PluginHook<Data>
]
export type RelatableAction = [string, AddOnPredicate]
export type ToolbarAction = { name: string; column?: any }
export type ToolbarActionDispatch = (name: string, column?: any) => void

export enum RELATABLE_ICONS {
  SORT = 'SORT',
  SORT_ASC = 'SORT_ASC',
  SORT_DESC = 'SORT_DESC',
  FILTER = 'FILTER',
  GROUP_BY = 'GROUP_BY'
}

export interface IRelatableStateInstance<
  Data extends object = any,
  State extends object = TableStateDefault
> extends TableInstance<Data> {
  availableGlobalActions: RelatableAction[]
  availableTableActions: RelatableAction[]
  getCustomCellColSpan: CellCollSpanGetter[]
  _originalColumns: Column<Data>[]
  _rowsToUse: Row<Data>[]

  state: State

  // add-on methods
  onCustomExpandedChange?: ExpandSetter<Data>
  onCustomSelectionChange?: SelectSetter<Data>
  onCustomFiltersChange?: FilterSetter<Data>
  onCustomGroupingChange?: GroupSetter<Data>
  onCustomSortChange?: SortSetter<Data>
  onCustomPageSizeChange?: PageSizeSetter
  onCustomPageChange?: PageSetter
}

/**
 * Externally exposed types
 */
export type CellCollSpanGetter<Data extends object = any> = (
  cell: Cell<Data>
) => number | string | undefined
export type StateChangeHandler<State = any> = (
  state: Partial<State>,
  changedKeys: string[]
) => void
export type PageSetter = (pageIndex: number) => void
export type PageSizeSetter = (pageSize: number) => void
export type GroupSetter<Data extends object = any> = (
  column: ColumnInstance<Data> & UseGroupByColumnProps<Data>,
  group: boolean
) => void
export type ExpandSetter<Data extends object = any> = (
  rows: (Row<Data> & UseExpandedRowProps<Data>)[],
  expand: boolean
) => void
export type SelectSetter<Data extends object = any> = (
  rows: Row<Data>[],
  select: boolean
) => void

/* Sorting */
export enum SORT_ACTIONS {
  SORT_CLEAR = 'SORT_CLEAR',
  SORT_DESC = 'SORT_DESC',
  SORT_ASC = 'SORT_ASC'
}

export type SortSetter<Data extends object = any> = (
  column: ColumnInstance<Data> & UseSortByColumnProps<Data>,
  action: SORT_ACTIONS
) => void

/* Filters */
export enum FILTER_ACTIONS {
  FILTER_CLEAR = 'FILTER_CLEAR',
  FILTER_ADD = 'FILTER_ADD',
  FILTER_REMOVE = 'FILTER_REMOVE'
}

export type FilterSetter<Data extends object = any> = (
  column: ColumnInstance<Data> & UseFiltersColumnProps<Data>,
  action: FILTER_ACTIONS,
  values: any[]
) => void
