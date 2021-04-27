import { useCallback, useMemo, useState } from 'react'
import {
  SortingRule,
  useSortBy,
  UseSortByInstanceProps,
  UseSortByOptions,
  UseSortByState
} from 'react-table'
import { filter, values } from 'lodash-es'

import {
  RelatableStateInstance,
  SORT_ACTIONS,
  SortSetter,
  TableAddOnReturn
} from '../relatable.types'

export interface WithSortingOptions<Data extends object = any>
  extends UseSortByOptions<Data> {
  onSortChange?: SortSetter<Data>

  // react-table state override https://react-table.js.org/api/useSortBy
  sortBy?: SortingRule<Data>[]
}

export interface WithSortingState<Data extends object = any>
  extends UseSortByState<Data> {
  onCustomSortChange: SortSetter<Data>
}

export interface WithSortingInstance<Data extends object = any>
  extends UseSortByInstanceProps<Data>,
    RelatableStateInstance<Data, WithSortingState<Data>> {
  onCustomSortChange: SortSetter<Data>
}

export default function withSorting<Data extends object = any>(
  options: WithSortingOptions<Data> = {}
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
        (): Partial<WithSortingInstance> => ({
          ...tableParams,
          onCustomSortChange
        }),
        [onCustomSortChange, ...values(tableParams)]
      ),
    () => useMemo(() => stateParams, [sortBy]),
    useSortBy
  ]
}
