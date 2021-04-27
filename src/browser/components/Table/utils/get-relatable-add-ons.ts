import { RelatableProps } from '../components/relatable/relatable'
import { TableAddOnReturn } from '../relatable.types'

import {
  withFilters,
  withPagination,
  withSorting,
  withGrouping,
  withExpanded,
  withSelection
} from '../add-ons'

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
}: RelatableProps): TableAddOnReturn[] {
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
