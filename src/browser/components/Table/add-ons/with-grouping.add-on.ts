import { useCallback, useMemo } from 'react'
import {
  Column,
  IdType,
  useGroupBy,
  UseGroupByColumnOptions,
  UseGroupByInstanceProps,
  UseGroupByOptions,
  UseGroupByState
} from 'react-table'
import { values } from 'lodash-es'

import {
  GroupSetter,
  RelatableStateInstance,
  TableAddOnReturn
} from '../relatable.types'

import { DEFAULT_AGGREGATE_OPTIONS } from '../constants'

import { ValueAggregate, CellProps } from '../components/renderers'

export interface WithGroupingOptions<Data extends object = any>
  extends UseGroupByOptions<Data> {
  defaultAggregate?: string[] | string | ((values: any[]) => any)
  defaultAggregateCell?: React.FC<CellProps>
  onGroupChange?: GroupSetter<Data>

  // react-table state override https://react-table.js.org/api/useGroupBy
  groupBy?: IdType<Data>[]
}

export type WithGroupingState<Data extends object = any> = UseGroupByState<Data>

export interface WithGroupingInstance<Data extends object = any>
  extends UseGroupByInstanceProps<Data>,
    RelatableStateInstance<Data, WithGroupingState<Data>> {
  onCustomGroupingChange: GroupSetter<Data>
  defaultColumn: Partial<Column<Data> & UseGroupByColumnOptions<Data>>
}

export default function withGrouping<Data extends object = any>(
  options: WithGroupingOptions<Data> = {}
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
        (): Partial<WithGroupingInstance> => ({
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
