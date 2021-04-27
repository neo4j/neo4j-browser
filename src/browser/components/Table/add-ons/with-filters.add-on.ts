import { useCallback, useMemo, useState } from 'react'
import {
  Column,
  Filters,
  useFilters,
  UseFiltersColumnOptions,
  UseFiltersInstanceProps,
  UseFiltersOptions,
  UseFiltersState
} from 'react-table'
import { filter, includes, map, values } from 'lodash-es'

import {
  FILTER_ACTIONS,
  FilterSetter,
  RelatableStateInstance,
  TableAddOnReturn
} from '../relatable.types'

import { FilterFieldProps, TextFilter } from '../components/renderers'

export interface WithFiltersOptions<Data extends object = any>
  extends UseFiltersOptions<Data> {
  defaultFilterCell?: React.FC<FilterFieldProps>
  onFilterChange?: FilterSetter<Data>

  // react-table state override https://react-table.js.org/api/useFilters
  // with custom filter value array
  filters?: Filters<Data>[]
}

export type WithFiltersState<Data extends object = any> = UseFiltersState<Data>

export interface WithFiltersInstance<Data extends object = any>
  extends UseFiltersInstanceProps<Data>,
    RelatableStateInstance<Data, WithFiltersState<Data>> {
  onCustomFilterChange: FilterSetter<Data>
  defaultColumn: Partial<Column<Data> & UseFiltersColumnOptions<Data>>
}

export default function withFilters<Data extends object = any>(
  options: WithFiltersOptions<Data> = {}
): TableAddOnReturn {
  const {
    defaultFilterCell,
    filters: theirFilters,
    onFilterChange,
    ...rest
  } = options
  const [ourFilters, setOurFilters] = useState<Filters<Data>>([])
  const filters = theirFilters || ourFilters
  const stateParams = { filters }
  const onCustomFilterChange: FilterSetter = useCallback(
    (column, action, values) => {
      if (onFilterChange) {
        onFilterChange(column, action, values)

        return
      }

      if (action === FILTER_ACTIONS.FILTER_CLEAR) {
        setOurFilters(filter(ourFilters, ({ id }) => id === column.id))

        return
      }

      if (action === FILTER_ACTIONS.FILTER_ADD) {
        setOurFilters([
          ...ourFilters,
          ...map(values, value => ({ id: column.id, value }))
        ])

        return
      }

      setOurFilters(
        filter(
          ourFilters,
          ({ id, value }) => !(id === column.id && includes(values, value))
        )
      )
    },
    [onFilterChange, ourFilters, setOurFilters]
  )

  const tableParams = {
    ...rest,
    onCustomFilterChange,
    defaultColumn: {
      Filter: defaultFilterCell || TextFilter
    }
  }

  return [
    withFilters.name,
    null,
    ({ canFilter }) => canFilter,
    ({ defaultColumn }) =>
      useMemo(
        (): Partial<WithFiltersInstance> => ({
          ...tableParams,
          defaultColumn: {
            ...defaultColumn,
            ...tableParams.defaultColumn
          }
        }),
        [
          defaultColumn,
          defaultFilterCell,
          onCustomFilterChange,
          ...values(rest)
        ]
      ),
    () => useMemo(() => stateParams, [filters]),
    useFilters
  ]
}
