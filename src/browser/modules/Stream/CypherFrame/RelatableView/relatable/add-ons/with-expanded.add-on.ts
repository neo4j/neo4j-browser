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
import { forEach, values } from 'lodash-es'
import { useCallback, useMemo } from 'react'
import {
  IdType,
  UseExpandedInstanceProps,
  UseExpandedOptions,
  UseExpandedState,
  useExpanded
} from 'react-table'

import { ExpandedRow, IRowProps } from '../components/renderers'
import {
  ExpandSetter,
  IRelatableStateInstance,
  TableAddOnReturn
} from '../relatable.types'
import arrayHasItems from '../utils/array-has-items'

export interface IWithExpandedOptions<Data extends object = any>
  extends UseExpandedOptions<Data> {
  onExpandedChange?: ExpandSetter<Data>
  expandedRowComponent?: React.FC<IRowProps>

  // react-table state override https://react-table.js.org/api/useExpanded
  expanded?: IdType<Data>[]
}

export interface IWithExpandedState<Data extends object = any>
  extends UseExpandedState<Data> {
  expandSubRows: false
  CustomExpandedRowComponent: React.FC<IRowProps>
  onCustomExpandedChange: ExpandSetter<Data>
}

export interface IWithExpandedInstance<Data extends object = any>
  extends UseExpandedInstanceProps<Data>,
    IRelatableStateInstance<Data, IWithExpandedState<Data>> {
  expandSubRows: false
  CustomExpandedRowComponent: React.FC<IRowProps>
  onCustomExpandedChange: ExpandSetter<Data>
}

export default function withExpanded<Data extends object = any>(
  options: IWithExpandedOptions<Data> = {}
): TableAddOnReturn {
  const {
    expanded,
    expandedRowComponent = ExpandedRow,
    onExpandedChange,
    ...tableParams
  } = options
  const stateParams = expanded ? { expanded } : {}
  const onCustomExpandedChange: ExpandSetter = useCallback(
    (rows, expand) => {
      if (onExpandedChange) {
        onExpandedChange(rows, expand)

        return
      }

      forEach(rows, row => row.toggleRowExpanded(expand))
    },
    [onExpandedChange]
  )

  return [
    withExpanded.name,
    null,
    ({ subRows }) => arrayHasItems(subRows),
    () =>
      useMemo(
        (): Partial<IWithExpandedInstance> => ({
          ...tableParams,
          expandSubRows: false,
          CustomExpandedRowComponent: expandedRowComponent,
          onCustomExpandedChange
        }),
        [expandedRowComponent, onCustomExpandedChange, ...values(tableParams)]
      ),
    () => useMemo(() => stateParams, [expanded]),
    useExpanded
  ]
}
