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
  entries,
  filter,
  find,
  flatMap,
  get,
  groupBy,
  head,
  map
} from 'lodash-es'
import React, { useCallback, useState } from 'react'
import { Button, Divider, Form, Icon, Label, Menu } from 'semantic-ui-react'
import { FormSelect } from 'semantic-ui-react'

import { IWithFiltersInstance, withFilters } from '../../add-ons'
import { FILTER_ACTIONS, RELATABLE_ICONS } from '../../relatable.types'
import {
  useRelatableStateContext,
  useRelatableToolbarContext
} from '../../states'
import arrayHasItems from '../../utils/array-has-items'
import { columnHasAction } from '../../utils/column-actions'
import { getRelatableAction } from '../../utils/relatable-actions'
import { getToolbarStateClass } from '../../utils/relatable-state-classes'
import RelatableIcon from '../relatable-icon'
import { Filter } from '../renderers'
import { ToolbarPopup } from './toolbar-popup'

export default function FilterableToolbar() {
  const {
    allColumns: columns,
    state: { filters },
    onCustomFilterChange
  } = useRelatableStateContext<any, IWithFiltersInstance>()
  const [selectedToolbarAction, setToolbar, clearToolbar] =
    useRelatableToolbarContext()
  const appliedFilterValues = map(filters, ({ value }) => value)
  const isFiltered = arrayHasItems(appliedFilterValues)

  return (
    <ToolbarPopup
      name={withFilters.name}
      content={
        <FiltersPopup
          columns={columns}
          selectedToolbarAction={selectedToolbarAction}
          appliedFilters={filters}
          isFiltered={isFiltered}
          onClose={clearToolbar}
          onCustomFilterChange={onCustomFilterChange}
        />
      }
      selectedToolbarAction={selectedToolbarAction}
      onClose={clearToolbar}
    >
      <Menu.Item name="filter" onClick={() => setToolbar(withFilters.name)}>
        <RelatableIcon name={RELATABLE_ICONS.FILTER} />
        Filters
        {isFiltered && (
          <Label
            className={isFiltered ? getToolbarStateClass('filterValue') : ''}
          >
            {appliedFilterValues.length}
          </Label>
        )}
      </Menu.Item>
    </ToolbarPopup>
  )
}

function FiltersPopup({
  columns,
  selectedToolbarAction,
  isFiltered,
  onClose,
  appliedFilters,
  onCustomFilterChange
}: any) {
  return (
    <div className="relatable__toolbar-popup relatable__toolbar-filters-popup">
      {isFiltered && (
        <>
          {flatMap(
            entries(groupBy(appliedFilters, 'id')),
            ([id, columnFilters]) => {
              const column = find(columns, column => column.id === id)

              return map(columnFilters, ({ value }) => (
                <Label
                  key={`${id}: ${value.value}`}
                  className="relatable__toolbar-value"
                >
                  <FilterItem column={column} value={value} />
                  <Icon
                    name="close"
                    onClick={() =>
                      onCustomFilterChange(
                        column,
                        FILTER_ACTIONS.FILTER_REMOVE,
                        [value]
                      )
                    }
                  />
                </Label>
              ))
            }
          )}
          <Divider />
        </>
      )}
      <FiltersForm
        columns={columns}
        selectedToolbarAction={selectedToolbarAction}
        onCustomFilterChange={onCustomFilterChange}
        onClose={onClose}
      />
    </div>
  )
}

function FiltersForm({
  columns,
  selectedToolbarAction,
  onCustomFilterChange,
  onClose
}: any) {
  const { availableGlobalActions } = useRelatableStateContext()
  const relatableAction = getRelatableAction(
    availableGlobalActions,
    selectedToolbarAction.name
  )
  const columnsToUse = filter(
    columns,
    column => relatableAction && columnHasAction(column, relatableAction)
  )
  const firstId = selectedToolbarAction.column
    ? selectedToolbarAction.column.id
    : get(head(columnsToUse), 'id', undefined)
  const [filterValue, onFilterValueChange] = useState<any>()
  const [selectedColumnId, setSelectedColumnId] = useState<any>(firstId)
  const selectedColumn = find(columnsToUse, ({ id }) => id === selectedColumnId)
  const columnOptions = map(filter(columnsToUse, 'canFilter'), column => ({
    key: column.id,
    value: column.id,
    text: column.Header
  }))
  const onSubmit = useCallback(() => {
    onClose()
    onCustomFilterChange(selectedColumn, FILTER_ACTIONS.FILTER_ADD, [
      filterValue
    ])
  }, [onCustomFilterChange, selectedColumn, filterValue])

  return (
    <Form onSubmit={onSubmit} className="relatable__toolbar-filters-form">
      <h3>Add filter</h3>
      <Form.Group>
        <Form.Field>
          <FormSelect
            options={columnOptions}
            value={selectedColumnId}
            search
            onChange={(_, { value }) => setSelectedColumnId(value)}
          />
        </Form.Field>
        <Filter column={selectedColumn} onChange={onFilterValueChange} />
        <Button
          basic
          icon
          color="black"
          className="relatable__toolbar-popup-button"
          title="Add"
          disabled={!filterValue}
        >
          <Icon name="check" />
        </Button>
      </Form.Group>
    </Form>
  )
}

function FilterItem({ column, value }: any) {
  return (
    <span className="relatable__toolbar-filters-item">
      {column.render('Header')}: {value.value}
    </span>
  )
}
