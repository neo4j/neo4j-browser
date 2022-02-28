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
import { filter, find, get, head, map } from 'lodash-es'
import React, { useCallback, useState } from 'react'
import { Button, Divider, Form, Icon, Label, Menu } from 'semantic-ui-react'
import { FormSelect } from 'semantic-ui-react'

import { IWithGroupingInstance, withGrouping } from '../../add-ons'
import { RELATABLE_ICONS } from '../../relatable.types'
import {
  useRelatableStateContext,
  useRelatableToolbarContext
} from '../../states'
import arrayHasItems from '../../utils/array-has-items'
import { columnHasAction } from '../../utils/column-actions'
import { getRelatableAction } from '../../utils/relatable-actions'
import { getToolbarStateClass } from '../../utils/relatable-state-classes'
import RelatableIcon from '../relatable-icon'
import { ToolbarPopup } from './toolbar-popup'

export default function GroupableToolbar() {
  const {
    allColumns: columns,
    state: { groupBy },
    onCustomGroupingChange
  } = useRelatableStateContext<any, IWithGroupingInstance>()
  const [selectedToolbarAction, setToolbar, clearToolbar] =
    useRelatableToolbarContext()
  const isGrouped = arrayHasItems(groupBy)

  return (
    <ToolbarPopup
      name={withGrouping.name}
      content={
        <GroupingPopup
          columns={columns}
          groupBy={groupBy}
          onClose={clearToolbar}
          selectedToolbarAction={selectedToolbarAction}
          onCustomGroupingChange={onCustomGroupingChange}
        />
      }
      selectedToolbarAction={selectedToolbarAction}
      onClose={clearToolbar}
    >
      <Menu.Item name="group" onClick={() => setToolbar(withGrouping.name)}>
        <RelatableIcon name={RELATABLE_ICONS.GROUP_BY} />
        Groups
        {isGrouped && (
          <Label className={isGrouped ? getToolbarStateClass('isGrouped') : ''}>
            {groupBy.length}
          </Label>
        )}
      </Menu.Item>
    </ToolbarPopup>
  )
}

function GroupingPopup({
  columns,
  groupBy,
  onClose,
  selectedToolbarAction,
  onCustomGroupingChange
}: any) {
  return (
    <div className="relatable__toolbar-popup relatable__toolbar-grouping-popup">
      {arrayHasItems(groupBy) && (
        <>
          {map(groupBy, id => {
            const column = find(columns, column => column.id === id)

            return (
              <Label key={id} className="relatable__toolbar-value">
                {column.render('Header')}
                <Icon
                  name="close"
                  onClick={() => onCustomGroupingChange(column, false)}
                />
              </Label>
            )
          })}
          <Divider />
        </>
      )}
      <GroupingForm
        columns={columns}
        selectedToolbarAction={selectedToolbarAction}
        onCustomGroupingChange={onCustomGroupingChange}
        onClose={onClose}
      />
    </div>
  )
}

function GroupingForm({
  columns,
  onCustomGroupingChange,
  selectedToolbarAction,
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
  const firstId = get(head(columnsToUse), 'id', undefined)
  const [selectedColumnId, setSelectedColumnId] = useState<any>(firstId)
  const selectedColumn = find(columnsToUse, ({ id }) => id === selectedColumnId)
  const columnOptions = map(filter(columnsToUse, 'canGroupBy'), column => ({
    key: column.id,
    value: column.id,
    text: column.Header
  }))
  const onSubmit = useCallback(() => {
    onClose()
    onCustomGroupingChange(selectedColumn, true)
  }, [onCustomGroupingChange, selectedColumn])

  return (
    <Form onSubmit={onSubmit} className="relatable__toolbar-grouping-form">
      <Form.Group>
        <Form.Field>
          <FormSelect
            options={columnOptions}
            value={selectedColumnId}
            search
            searchInput={{ autoFocus: true }}
            onChange={(_, { value }) => setSelectedColumnId(value)}
          />
        </Form.Field>
        <Button
          basic
          icon
          color="black"
          className="relatable__toolbar-popup-button"
          title="Add"
        >
          <Icon name="check" />
        </Button>
      </Form.Group>
    </Form>
  )
}
