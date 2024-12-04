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
import { assign, flatMap, map, omit, reduce, values } from 'lodash-es'
import { useCallback, useMemo, useState } from 'react'
import {
  RowSelectionState,
  TableOptions,
  getCoreRowModel,
  getFilteredRowModel,
} from '@tanstack/react-table'

import {
  IRelatableStateInstance,
  SelectSetter,
  TableAddOnReturn
} from '../relatable.types'
import arrayHasItems from '../utils/array-has-items'

export interface IWithSelectionOptions<Data extends object = any>
  extends Partial<TableOptions<Data>> {
  onSelectionChange?: SelectSetter<Data>
  selectedRowIds?: RowSelectionState
}

export type IWithSelectionState = {
  rowSelection: RowSelectionState
}

export interface IWithSelectionInstance<Data extends object = any>
  extends IRelatableStateInstance<Data, IWithSelectionState> {
  onCustomSelectionChange: SelectSetter<Data>
  state: { rowSelection: RowSelectionState }
  getToggleAllRowsSelectedProps: () => any
  getToggleAllPageRowsSelectedProps: () => any
  toggleRowSelected: (rowId: string) => void
  enableRowSelection?: boolean
  getCoreRowModel?: typeof getCoreRowModel
  getFilteredRowModel?: typeof getFilteredRowModel
}

export default function withSelection<Data extends object = any>(
  options: IWithSelectionOptions<Data> = {}
): TableAddOnReturn {
  const {
    selectedRowIds: initialRowSelection,
    onSelectionChange,
    ...tableParams
  } = options
  
  const [rowSelection, setRowSelection] = useState<RowSelectionState>(
    initialRowSelection ?? {}
  )

  const onCustomSelectionChange: SelectSetter = useCallback(
    (rows, select) => {
      if (onSelectionChange) {
        onSelectionChange(rows, select)
        return
      }

      const newIds = flatMap(rows, ({ id, subRows }) =>
        arrayHasItems(subRows) ? map(subRows, subRow => subRow.id) : [id]
      )

      setRowSelection(old => {
        if (select) {
          return reduce(
            newIds,
            (agg, id) => assign(agg, { [id]: true }),
            { ...old }
          )
        }
        return omit(old, newIds)
      })
    },
    [onSelectionChange, rowSelection]
  )

  return [
    withSelection.name,
    null,
    () => true,
    () =>
      useMemo(
        (): Partial<IWithSelectionInstance<Data>> => ({
          ...tableParams,
          onCustomSelectionChange,
          state: { rowSelection },
          enableRowSelection: true,
          getCoreRowModel,
          getFilteredRowModel
        }),
        [onCustomSelectionChange, rowSelection, ...values(tableParams)]
      ),
    () => useMemo(() => ({ rowSelection }), [rowSelection]),
    undefined
  ]
}
