import React, { PropsWithChildren } from 'react'
import { Column } from 'react-table'

import {
  WithPaginationOptions,
  WithSortingOptions,
  WithFiltersOptions,
  WithGroupingOptions,
  WithExpandedOptions,
  WithSelectionOptions
} from '../../add-ons'
import { CellCollSpanGetter, StateChangeHandler } from '../../relatable.types'

import { RelatableActionContext, RelatableStateContext } from '../../states'
import { useRelatableActions, useRelatableState } from './relatable.hooks'

import Table, { TableProps } from '../table'
import Pagination from '../pagination'
import { StyleWrapper } from './relatable.styled'

export interface RelatableProps<Data extends object = any> {
  // see https://react-table.js.org/api/usetable
  columns: Column<Data>[]
  data: Data[]
  defaultColumn?: Partial<Column<Data>>

  // Relatable state change handler
  onStateChange?: StateChangeHandler

  // cell col span getter
  getCellColSpan?: CellCollSpanGetter

  // add on options
  filterable?: boolean | WithFiltersOptions
  groupable?: boolean | WithGroupingOptions
  sortable?: boolean | WithSortingOptions
  expandable?: boolean | WithExpandedOptions
  paginated?: boolean | WithPaginationOptions
  selectable?: boolean | WithSelectionOptions
}

// when used without children, Table props are passed along as well
interface RelatableBasicProps extends RelatableProps, TableProps {}

export type RelatableFullProps = PropsWithChildren<RelatableProps>

export default function Relatable(
  props: RelatableFullProps | RelatableBasicProps
): JSX.Element {
  //@ts-ignore
  const { children } = props

  if (children) {
    return <RelatableState {...props} />
  }

  return <RelatableBasic {...props} />
}

function RelatableBasic(props: RelatableBasicProps): JSX.Element {
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
}: RelatableFullProps): JSX.Element {
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
