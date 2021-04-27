import React, { useCallback } from 'react'
import { Table as SemanticTable } from 'semantic-ui-react'

import { RELATABLE_ICONS, SORT_ACTIONS } from '../relatable.types'

import { useRelatableStateContext } from '../states'

import RelatableIcon from './relatable-icon'

export interface ColumnActionsProps {
  column: any

  [key: string]: any
}

export default function ColumnActions({
  column,
  ...headerProps
}: ColumnActionsProps) {
  const { onCustomSortChange } = useRelatableStateContext()
  const onSort = useCallback(() => {
    if (!onCustomSortChange) return

    const { isSortedDesc, isSorted } = column

    if (!isSorted) {
      onCustomSortChange(column, SORT_ACTIONS.SORT_DESC)
      return
    }

    if (isSortedDesc) {
      onCustomSortChange(column, SORT_ACTIONS.SORT_ASC)
      return
    }

    onCustomSortChange(column, SORT_ACTIONS.SORT_CLEAR)
  }, [onCustomSortChange])

  return (
    <SemanticTable.HeaderCell
      {...headerProps}
      colSpan={
        column.colSpan !== undefined ? column.colSpan : headerProps.colSpan
      }
      onClick={onSort}
      className="relatable__table-cell relatable__table-header-cell relatable__table-header-cell--has-actions"
    >
      <div className="relatable__column-actions-header">
        {column.render('Header')}
        {getColumnStateIcon(column)}
      </div>
    </SemanticTable.HeaderCell>
  )
}

function getColumnStateIcon(column: any) {
  const { isSortedDesc, isSorted } = column

  if (!isSorted) return null

  if (isSortedDesc) return <RelatableIcon name={RELATABLE_ICONS.SORT_DESC} />

  return <RelatableIcon name={RELATABLE_ICONS.SORT_ASC} />
}
