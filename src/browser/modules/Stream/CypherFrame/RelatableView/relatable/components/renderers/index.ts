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
// default renderers
export { default as BodyRow } from './body-row'
export { default as BodyCell } from './body-cell'
export { default as Filter } from './filter'
export { default as ExpandedRow } from './expanded-row'

// cell values
export { default as JSONCell } from './cells/json-cell'
export { default as DateCell } from './cells/date-cell'
export { default as NumberCell } from './cells/number-cell'
export { default as TextCell } from './cells/text-cell'

// filters
export { default as TextFilter } from './filters/text-filter'

// aggregates
export { default as ValueAggregate } from './aggregates/value-aggregate'

export interface ICellProps {
  cell: any
  [key: string]: any
}

export interface IRowProps {
  row: any
  rowNumber: number
  loading?: boolean
}

export interface IFilterFieldProps {
  column: any
  onChange: (val: any) => void
}
