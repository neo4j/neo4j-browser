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
