import { useCallback, useMemo } from 'react'
import {
  IdType,
  useExpanded,
  UseExpandedInstanceProps,
  UseExpandedOptions,
  UseExpandedState
} from 'react-table'
import { forEach, values } from 'lodash-es'

import {
  ExpandSetter,
  RelatableStateInstance,
  TableAddOnReturn
} from '../relatable.types'

import { ExpandedRow, RowProps } from '../components/renderers'
import arrayHasItems from '../utils/array-has-items'

export interface WithExpandedOptions<Data extends object = any>
  extends UseExpandedOptions<Data> {
  onExpandedChange?: ExpandSetter<Data>
  expandedRowComponent?: React.FC<RowProps>

  // react-table state override https://react-table.js.org/api/useExpanded
  expanded?: IdType<Data>[]
}

export interface WithExpandedState<Data extends object = any>
  extends UseExpandedState<Data> {
  expandSubRows: false
  CustomExpandedRowComponent: React.FC<RowProps>
  onCustomExpandedChange: ExpandSetter<Data>
}

export interface WithExpandedInstance<Data extends object = any>
  extends UseExpandedInstanceProps<Data>,
    RelatableStateInstance<Data, WithExpandedState<Data>> {
  expandSubRows: false
  CustomExpandedRowComponent: React.FC<RowProps>
  onCustomExpandedChange: ExpandSetter<Data>
}

export default function withExpanded<Data extends object = any>(
  options: WithExpandedOptions<Data> = {}
): TableAddOnReturn {
  const {
    expanded,
    expandedRowComponent = ExpandedRow,
    onExpandedChange,
    ...tableParams
  } = options
  const stateParams = expanded ? { expanded } : {}
  const onCustomExpandedChange: ExpandSetter = useCallback(
    (rows, expand) => {
      if (onExpandedChange) {
        onExpandedChange(rows, expand)

        return
      }

      forEach(rows, row => row.toggleRowExpanded(expand))
    },
    [onExpandedChange]
  )

  return [
    withExpanded.name,
    null,
    ({ subRows }) => arrayHasItems(subRows),
    () =>
      useMemo(
        (): Partial<WithExpandedInstance> => ({
          ...tableParams,
          expandSubRows: false,
          CustomExpandedRowComponent: expandedRowComponent,
          onCustomExpandedChange
        }),
        [expandedRowComponent, onCustomExpandedChange, ...values(tableParams)]
      ),
    () => useMemo(() => stateParams, [expanded]),
    useExpanded
  ]
}
