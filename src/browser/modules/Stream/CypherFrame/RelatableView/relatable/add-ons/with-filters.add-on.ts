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
