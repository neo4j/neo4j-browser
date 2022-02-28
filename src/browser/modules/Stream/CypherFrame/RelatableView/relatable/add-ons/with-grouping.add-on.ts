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
import { values } from 'lodash-es'
import { useCallback, useMemo } from 'react'
import {
  Column,
  IdType,
  UseGroupByColumnOptions,
  UseGroupByInstanceProps,
  UseGroupByOptions,
  UseGroupByState,
  useGroupBy
} from 'react-table'

import { ICellProps, ValueAggregate } from '../components/renderers'
import { DEFAULT_AGGREGATE_OPTIONS } from '../constants'
import {
  GroupSetter,
  IRelatableStateInstance,
  TableAddOnReturn
} from '../relatable.types'

export interface IWithGroupingOptions<Data extends object = any>
  extends UseGroupByOptions<Data> {
  defaultAggregate?: string[] | string | ((values: any[]) => any)
  defaultAggregateCell?: React.FC<ICellProps>
  onGroupChange?: GroupSetter<Data>

  // react-table state override https://react-table.js.org/api/useGroupBy
  groupBy?: IdType<Data>[]
}

export type IWithGroupingState<Data extends object = any> =
  UseGroupByState<Data>

export interface IWithGroupingInstance<Data extends object = any>
  extends UseGroupByInstanceProps<Data>,
    IRelatableStateInstance<Data, IWithGroupingState<Data>> {
  onCustomGroupingChange: GroupSetter<Data>
  defaultColumn: Partial<Column<Data> & UseGroupByColumnOptions<Data>>
}

export default function withGrouping<Data extends object = any>(
  options: IWithGroupingOptions<Data> = {}
): TableAddOnReturn {
  const {
    groupBy,
    onGroupChange,
    defaultAggregateCell,
    defaultAggregate = DEFAULT_AGGREGATE_OPTIONS,
    ...rest
  } = options
  const stateParams = groupBy ? { groupBy } : {}
  const onCustomGroupingChange: GroupSetter = useCallback(
    (column, group) => {
      if (onGroupChange) {
        onGroupChange(column, group)

        return
      }

      column.toggleGroupBy()
    },
    [onGroupChange]
  )
  const tableParams = {
    ...rest,
    onCustomGroupingChange,
    defaultColumn: {
      aggregate: defaultAggregate,
      Aggregated: defaultAggregateCell || ValueAggregate
    }
  }

  return [
    withGrouping.name,
    null,
    ({ canGroupBy }) => canGroupBy,
    ({ defaultColumn }) =>
      useMemo(
        (): Partial<IWithGroupingInstance> => ({
          ...tableParams,
          // @ts-ignore
          defaultColumn: {
            ...defaultColumn,
            ...tableParams.defaultColumn
          }
        }),
        [
          onCustomGroupingChange,
          defaultAggregateCell,
          defaultAggregate,
          ...values(rest)
        ]
      ),
    () => useMemo(() => stateParams, [groupBy]),
    useGroupBy
  ]
}
