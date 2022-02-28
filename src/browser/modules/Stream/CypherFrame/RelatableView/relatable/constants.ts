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
export const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 30, 40, 50]
export const DEFAULT_AGGREGATE_OPTIONS = 'count'
export const ON_STATE_CHANGE_TRIGGERS = [
  'pageIndex',
  'pageSize',
  'sortBy',
  'filters',
  'groupBy',
  'selectedRowIds',
  'expanded'
]
export const SEMANTIC_TABLE_PROPS = [
  'attached',
  'basic',
  'className',
  'collapsing',
  'color',
  'compact',
  'definition',
  'fixed',
  'inverted',
  'padded',
  'singleLine',
  'size',
  'striped',
  'structured',
  'textAlign',
  'verticalAlign'
]

export const TOOLBAR_STATE_CLASSES = {
  isGrouped: 'rgb(245,166,35)',
  filterValue: 'rgb(253,118,110)',
  isSorted: 'rgb(109,206,157)',
  isSelected: 'rgb(104,189,244)'
}

export const ROW_STATE_CLASSES = {
  isSelected: 'rgba(104,189,244,0.10)'
}
