import { map } from 'lodash-es'
import React from 'react'
import {
  Form,
  PaginationProps,
  Pagination as SemanticPagination
} from 'semantic-ui-react'
import { FormSelect } from 'semantic-ui-react'

import { IWithPaginationInstance } from '../add-ons'
import { Omit } from '../relatable.types'
import { useRelatableStateContext } from '../states'

export interface IPaginationProps extends Omit<PaginationProps, 'totalPages'> {
  totalPages?: number
}

export default function Pagination(props: IPaginationProps = {}): JSX.Element {
  const {
    canPreviousPage,
    canNextPage,
    pageCount,
    gotoPage,
    onCustomPageChange,
    customPageSizeOptions,
    setPageSize,
    onCustomPageSizeChange,
    state: { pageIndex, pageSize }
  } = useRelatableStateContext<any, IWithPaginationInstance>()
  const pageSetter = onCustomPageChange || gotoPage
  const pageSizeSetter = onCustomPageSizeChange || setPageSize
  const pageSizeOptions = map(customPageSizeOptions, opt => ({
    key: opt,
    value: opt,
    text: opt
  }))

  return (
    <Form className="relatable__pagination">
      <Form.Field>
        <SemanticPagination
          activePage={pageIndex + 1}
          onPageChange={(_, { activePage }: any) => pageSetter(activePage - 1)}
          size="small"
          boundaryRange={0}
          siblingRange={1}
          ellipsisItem={null}
          totalPages={pageCount}
          firstItem={{ disabled: !canPreviousPage, content: '⟨⟨' }}
          lastItem={{ disabled: !canNextPage, content: '⟩⟩' }}
          prevItem={{ disabled: !canPreviousPage, content: '⟨' }}
          nextItem={{ disabled: !canNextPage, content: '⟩' }}
          {...props}
        />
      </Form.Field>
      <FormSelect
        label="Rows"
        inline
        search
        className="relatable__pagination-size-setter"
        options={pageSizeOptions}
        value={pageSize}
        onChange={(_, { value }: any) => pageSizeSetter(value)}
      />
    </Form>
  )
}
