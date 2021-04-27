import { useMemo } from 'react'
import {
  usePagination,
  UsePaginationInstanceProps,
  UsePaginationOptions,
  UsePaginationState
} from 'react-table'
import { pick, values } from 'lodash-es'

import {
  RelatableStateInstance,
  PageSetter,
  PageSizeSetter,
  TableAddOnReturn
} from '../relatable.types'

import { DEFAULT_PAGE_SIZE_OPTIONS } from '../constants'

export interface WithPaginationOptions<Data extends object = any>
  extends UsePaginationOptions<Data> {
  onPageChange?: PageSetter
  onPageSizeChange?: PageSizeSetter
  pageSizeOptions?: number[]

  // react-table state overrides https://react-table.js.org/api/usePagination
  pageSize?: number
  pageIndex?: number
}

export type WithPaginationState<Data extends object = any> = UsePaginationState<
  Data
>

export interface WithPaginationInstance<Data extends object = any>
  extends UsePaginationInstanceProps<Data>,
    RelatableStateInstance<Data, WithPaginationState<Data>> {
  customPageSizeOptions: number[]
  onCustomPageSizeChange?: PageSizeSetter
  onCustomPageChange?: PageSetter
}

export default function withPagination<Data extends object = any>(
  options: WithPaginationOptions<Data> = {}
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
        (): Partial<WithPaginationInstance> => ({
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
