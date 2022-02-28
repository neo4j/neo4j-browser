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
import { filter, values } from 'lodash-es'
import { useCallback, useMemo, useState } from 'react'
import {
  SortingRule,
  UseSortByInstanceProps,
  UseSortByOptions,
  UseSortByState,
  useSortBy
} from 'react-table'

import {
  IRelatableStateInstance,
  SORT_ACTIONS,
  SortSetter,
  TableAddOnReturn
} from '../relatable.types'

export interface IWithSortingOptions<Data extends object = any>
  extends UseSortByOptions<Data> {
  onSortChange?: SortSetter<Data>

  // react-table state override https://react-table.js.org/api/useSortBy
  sortBy?: SortingRule<Data>[]
}

export interface IWithSortingState<Data extends object = any>
  extends UseSortByState<Data> {
  onCustomSortChange: SortSetter<Data>
}

export interface IWithSortingInstance<Data extends object = any>
  extends UseSortByInstanceProps<Data>,
    IRelatableStateInstance<Data, IWithSortingState<Data>> {
  onCustomSortChange: SortSetter<Data>
}

export default function withSorting<Data extends object = any>(
  options: IWithSortingOptions<Data> = {}
): TableAddOnReturn {
  const { sortBy: theirSortBy, onSortChange, ...tableParams } = options
  const [ourSortBy, setOurSortBy] = useState<SortingRule<Data>[]>([])
  const sortBy = theirSortBy || ourSortBy
  const stateParams = { sortBy }
  const onCustomSortChange: SortSetter<Data> = useCallback(
    (column, action) => {
      if (onSortChange) {
        onSortChange(column, action)

        return
      }

      const withoutColumn = filter(ourSortBy, ({ id }) => id !== column.id)

      if (action === SORT_ACTIONS.SORT_CLEAR) {
        setOurSortBy(withoutColumn)

        return
      }

      setOurSortBy([
        ...withoutColumn,
        { id: column.id, desc: action === SORT_ACTIONS.SORT_DESC }
      ])
    },
    [onSortChange, ourSortBy, setOurSortBy]
  )

  return [
    withSorting.name,
    withSorting.name,
    ({ canSort }) => canSort,
    () =>
      useMemo(
        (): Partial<IWithSortingInstance> => ({
          ...tableParams,
          onCustomSortChange
        }),
        [onCustomSortChange, ...values(tableParams)]
      ),
    () => useMemo(() => stateParams, [sortBy]),
    useSortBy
  ]
}
