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
import React, { PropsWithChildren } from 'react'
import { Column } from 'react-table'

import {
  IWithExpandedOptions,
  IWithFiltersOptions,
  IWithGroupingOptions,
  IWithPaginationOptions,
  IWithSelectionOptions,
  IWithSortingOptions
} from '../../add-ons'
import { CellCollSpanGetter, StateChangeHandler } from '../../relatable.types'
import { RelatableActionContext, RelatableStateContext } from '../../states'
import Pagination from '../pagination'
import Table, { ITableProps } from '../table'
import { useRelatableActions, useRelatableState } from './relatable.hooks'
import { StyleWrapper } from './relatable.styled'

export interface IRelatableProps<Data extends object = any> {
  // see https://react-table.js.org/api/usetable
  columns: Column<Data>[]
  data: Data[]
  defaultColumn?: Partial<Column<Data>>

  // Relatable state change handler
  onStateChange?: StateChangeHandler

  // cell col span getter
  getCellColSpan?: CellCollSpanGetter

  // add on options
  filterable?: boolean | IWithFiltersOptions
  groupable?: boolean | IWithGroupingOptions
  sortable?: boolean | IWithSortingOptions
  expandable?: boolean | IWithExpandedOptions
  paginated?: boolean | IWithPaginationOptions
  selectable?: boolean | IWithSelectionOptions
}

// when used without children, Table props are passed along as well
export interface IRelatableBasicProps extends IRelatableProps, ITableProps {}

export type IRelatableChildrenProps = PropsWithChildren<IRelatableProps>

export default function Relatable(props: IRelatableBasicProps): JSX.Element {
  const { columns, data, defaultColumn, paginated, ...rest } = props

  return (
    <RelatableState {...props}>
      <Table {...rest} />
      {paginated && <Pagination />}
    </RelatableState>
  )
}

function RelatableState({
  children,
  ...rest
}: IRelatableChildrenProps): JSX.Element {
  const tableProps = useRelatableState(rest)

  return (
    <RelatableStateContext.Provider value={tableProps}>
      <RelatableActions>
        <StyleWrapper className="relatable">{children}</StyleWrapper>
      </RelatableActions>
    </RelatableStateContext.Provider>
  )
}

function RelatableActions({ children }: any) {
  const actionsState = useRelatableActions()

  return (
    <RelatableActionContext.Provider value={actionsState}>
      {children}
    </RelatableActionContext.Provider>
  )
}
