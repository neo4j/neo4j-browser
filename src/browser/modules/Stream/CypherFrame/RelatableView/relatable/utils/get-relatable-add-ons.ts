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
import {
  withExpanded,
  withFilters,
  withGrouping,
  withPagination,
  withSelection,
  withSorting
} from '../add-ons'
import { IRelatableProps } from '../components/relatable/relatable'
import { TableAddOnReturn } from '../relatable.types'

/**
 * Adds enhancers based on boolean props
 * @param     {Object}                                  props
 * @param     {boolean | IWithFiltersOptions}           props.filterable
 * @param     {boolean | IWithGroupingOptions}          props.groupable
 * @param     {boolean | IWithSortingOptions}           props.sortable
 * @param     {boolean | IWithPaginationOptions}        props.paginated
 * @param     {boolean | IWithSelectionOptions}         props.selectable
 * @return    {TableAddOnReturn[]}
 */
export default function getRelatableAddOns({
  groupable,
  filterable,
  sortable,
  paginated,
  expandable,
  selectable
}: IRelatableProps): TableAddOnReturn[] {
  const addOns: TableAddOnReturn[] = []

  if (filterable) {
    addOns.push(withFilters(filterable !== true ? filterable : {}))
  }

  if (groupable) {
    addOns.push(withGrouping(groupable !== true ? groupable : {}))
  }

  if (sortable) {
    addOns.push(withSorting(sortable !== true ? sortable : {}))
  }

  if (expandable) {
    addOns.push(withExpanded(expandable !== true ? expandable : {}))
  }

  if (paginated) {
    addOns.push(withPagination(paginated !== true ? paginated : {}))
  }

  if (selectable) {
    addOns.push(withSelection(selectable !== true ? selectable : {}))
  }

  return addOns
}
