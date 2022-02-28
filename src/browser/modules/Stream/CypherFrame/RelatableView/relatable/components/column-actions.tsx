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
import React, { useCallback } from 'react'
import { Table as SemanticTable } from 'semantic-ui-react'

import { RELATABLE_ICONS, SORT_ACTIONS } from '../relatable.types'
import { useRelatableStateContext } from '../states'
import RelatableIcon from './relatable-icon'

export interface IColumnActionsProps {
  column: any

  [key: string]: any
}

export default function ColumnActions({
  column,
  ...headerProps
}: IColumnActionsProps) {
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
