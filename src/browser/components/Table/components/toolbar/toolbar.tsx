import React from 'react'
import { Menu, MenuProps } from 'semantic-ui-react'

import { useRelatableStateContext } from '../../states'
import {
  withFilters,
  withGrouping,
  withSelection,
  withSorting
} from '../../add-ons'
import { isActionAvailable } from '../../utils/relatable-actions'

import SortableToolbar from './sortable.toolbar'
import FilterableToolbar from './filterable.toolbar'
import GroupableToolbar from './groupable.toolbar'
import SelectableToolbar from './selectable.toolbar'

export default function Toolbar(
  props: React.PropsWithChildren<MenuProps> = {}
): JSX.Element {
  const { className = '', children, ...rest } = props
  const { availableGlobalActions } = useRelatableStateContext()

  if (children) {
    return (
      <Menu
        icon
        secondary
        {...rest}
        className={`relatable__toolbar ${className}`}
      >
        {children}
      </Menu>
    )
  }

  return (
    <Menu
      icon
      secondary
      {...rest}
      className={`relatable__toolbar ${className}`}
    >
      {isActionAvailable(availableGlobalActions, withGrouping.name) && (
        <GroupableToolbar />
      )}
      {isActionAvailable(availableGlobalActions, withFilters.name) && (
        <FilterableToolbar />
      )}
      {isActionAvailable(availableGlobalActions, withSorting.name) && (
        <SortableToolbar />
      )}
      {isActionAvailable(availableGlobalActions, withSelection.name) && (
        <SelectableToolbar />
      )}
    </Menu>
  )
}
