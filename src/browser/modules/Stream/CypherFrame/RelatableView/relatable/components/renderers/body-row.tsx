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
import React, { useCallback } from 'react'
import { Label, Table as SemanticTable } from 'semantic-ui-react'

import { IWithExpandedInstance } from '../../add-ons'
import { IRelatableStateInstance } from '../../relatable.types'
import { useRelatableStateContext } from '../../states'
import arrayHasItems from '../../utils/array-has-items'
import { getRowClasses } from '../../utils/relatable-state-classes'
import { BodyCell, IRowProps } from './index'
import RowActions from './row-actions'

export default function BodyRow(props: IRowProps) {
  const { row, rowNumber, loading, ...rowProps } = props
  const { isExpanded } = row
  const {
    onCustomExpandedChange,
    onCustomSelectionChange,
    getCustomCellColSpan
  } = useRelatableStateContext()
  const onExpandClick = useCallback(
    () => onCustomExpandedChange!([row], !row.isExpanded),
    [onCustomExpandedChange, row]
  )
  const onSelectClick = useCallback(
    (select: boolean) => onCustomSelectionChange!([row], select),
    [onCustomSelectionChange, row]
  )

  return (
    <>
      <SemanticTable.Row {...rowProps} className={getRowClasses(row)}>
        <SemanticTable.Cell className="relatable__table-cell relatable__table-body-cell relatable__table-row-actions-cell">
          <Label className="relatable__table-row-number">
            {rowNumber.toLocaleString()}
          </Label>
          <RowActions
            rows={[row]}
            onExpandClick={
              onCustomExpandedChange &&
              arrayHasItems(row.subRows) &&
              onExpandClick
            }
            onSelectClick={onCustomSelectionChange && onSelectClick}
          />
        </SemanticTable.Cell>
        {!loading &&
          map(row.cells, cell => (
            <BodyCell
              cell={cell}
              getCellColSpan={getCustomCellColSpan}
              {...cell.getCellProps()}
            />
          ))}
        {loading && (
          <SemanticTable.Cell
            className="relatable__table-cell relatable__table-body-cell"
            colSpan="100%"
          >
            <div className="relatable__table-body-cell-loader" />
          </SemanticTable.Cell>
        )}
      </SemanticTable.Row>
      {!loading && isExpanded && <ExpandedRow {...props} />}
    </>
  )
}

type ExpandedRowStateContext = IRelatableStateInstance & IWithExpandedInstance

function ExpandedRow(props: IRowProps) {
  const { row } = props
  const { CustomExpandedRowComponent } = useRelatableStateContext<
    any,
    ExpandedRowStateContext
  >()
  const rowProps = row.getRowProps()

  return (
    <SemanticTable.Row
      {...rowProps}
      key={`${rowProps.key}-expanded`}
      className="relatable__table-body-row relatable__table-body-expanded-row"
    >
      <SemanticTable.Cell className="relatable__table-body-cell" colSpan="100%">
        <CustomExpandedRowComponent {...props} />
      </SemanticTable.Cell>
    </SemanticTable.Row>
  )
}
