import { filter, includes, map, values } from 'lodash-es'
import { useCallback, useMemo, useState } from 'react'
import {
  Column,
  Filters,
  UseFiltersColumnOptions,
  UseFiltersInstanceProps,
  UseFiltersOptions,
  UseFiltersState,
  useFilters
} from 'react-table'

import { IFilterFieldProps, TextFilter } from '../components/renderers'
import {
  FILTER_ACTIONS,
  FilterSetter,
  IRelatableStateInstance,
  TableAddOnReturn
} from '../relatable.types'

export interface IWithFiltersOptions<Data extends object = any>
  extends UseFiltersOptions<Data> {
  defaultFilterCell?: React.FC<IFilterFieldProps>
  onFilterChange?: FilterSetter<Data>

  // react-table state override https://react-table.js.org/api/useFilters
  // with custom filter value array
  filters?: Filters<Data>[]
}

export type IWithFiltersState<Data extends object = any> = UseFiltersState<Data>

export interface IWithFiltersInstance<Data extends object = any>
  extends UseFiltersInstanceProps<Data>,
    IRelatableStateInstance<Data, IWithFiltersState<Data>> {
  onCustomFilterChange: FilterSetter<Data>
  defaultColumn: Partial<Column<Data> & UseFiltersColumnOptions<Data>>
}

export default function withFilters<Data extends object = any>(
  options: IWithFiltersOptions<Data> = {}
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
        (): Partial<IWithFiltersInstance> => ({
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
