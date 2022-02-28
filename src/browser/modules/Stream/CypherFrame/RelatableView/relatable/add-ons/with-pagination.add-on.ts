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
import { pick, values } from 'lodash-es'
import { useMemo } from 'react'
import {
  UsePaginationInstanceProps,
  UsePaginationOptions,
  UsePaginationState,
  usePagination
} from 'react-table'

import { DEFAULT_PAGE_SIZE_OPTIONS } from '../constants'
import {
  IRelatableStateInstance,
  PageSetter,
  PageSizeSetter,
  TableAddOnReturn
} from '../relatable.types'

export interface IWithPaginationOptions<Data extends object = any>
  extends UsePaginationOptions<Data> {
  onPageChange?: PageSetter
  onPageSizeChange?: PageSizeSetter
  pageSizeOptions?: number[]

  // react-table state overrides https://react-table.js.org/api/usePagination
  pageSize?: number
  pageIndex?: number
}

export type IWithPaginationState<Data extends object = any> =
  UsePaginationState<Data>

export interface IWithPaginationInstance<Data extends object = any>
  extends UsePaginationInstanceProps<Data>,
    IRelatableStateInstance<Data, IWithPaginationState<Data>> {
  customPageSizeOptions: number[]
  onCustomPageSizeChange?: PageSizeSetter
  onCustomPageChange?: PageSetter
}

export default function withPagination<Data extends object = any>(
  options: IWithPaginationOptions<Data> = {}
): TableAddOnReturn {
  const {
    pageSize,
    pageIndex,
    onPageSizeChange,
    onPageChange,
    pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
    ...tableParams
  } = options
  const stateParams = pick(options, ['pageSize', 'pageIndex'])

  return [
    withPagination.name,
    null,
    () => false,
    () =>
      useMemo(
        (): Partial<IWithPaginationInstance> => ({
          ...tableParams,
          customPageSizeOptions: pageSizeOptions,
          // @todo: figure out strategy for these
          onCustomPageSizeChange: onPageSizeChange,
          onCustomPageChange: onPageChange
        }),
        [onPageSizeChange, onPageChange, ...values(tableParams)]
      ),
    () => useMemo(() => stateParams, values(stateParams)),
    usePagination
  ]
}
