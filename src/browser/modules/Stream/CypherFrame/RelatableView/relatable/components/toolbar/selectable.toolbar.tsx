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
import { entries, filter, head, map } from 'lodash-es'
import React, { useCallback } from 'react'
import { Button, Form, Icon, Label, Menu } from 'semantic-ui-react'

import {
  IWithFiltersInstance,
  IWithSelectionInstance,
  withSelection
} from '../../add-ons'
import {
  useRelatableStateContext,
  useRelatableToolbarContext
} from '../../states'
import arrayHasItems from '../../utils/array-has-items'
import { getToolbarStateClass } from '../../utils/relatable-state-classes'
import { ToolbarPopup } from './toolbar-popup'

export default function SelectableToolbar() {
  const {
    selectedFlatRows,
    state: { selectedRowIds }
  } = useRelatableStateContext<any, IWithSelectionInstance>()
  const [selectedToolbarAction, setToolbar, clearToolbar] =
    useRelatableToolbarContext()
  const selectedRows = filter(
    entries(selectedRowIds),
    ([, selected]) => selected
  )
  const isSelected = arrayHasItems(selectedRows)

  return (
    <ToolbarPopup
      name={withSelection.name}
      content={
        <SelectionPopup
          rows={selectedFlatRows}
          selectedRowIds={map(selectedRows, head)}
          selectedToolbarAction={selectedToolbarAction}
        />
      }
      selectedToolbarAction={selectedToolbarAction}
      onClose={clearToolbar}
    >
      <Menu.Item
        name="selection"
        disabled={!isSelected}
        onClick={() => setToolbar(withSelection.name)}
      >
        <Icon name="list ul" className="relatable__toolbar-icon" />
        Selected
        {isSelected && (
          <Label
            className={isSelected ? getToolbarStateClass('isSelected') : ''}
          >
            {selectedRows.length}
          </Label>
        )}
      </Menu.Item>
    </ToolbarPopup>
  )
}

function SelectionPopup({ rows, selectedRowIds }: any) {
  const { onCustomSelectionChange } = useRelatableStateContext<
    any,
    IWithSelectionInstance & IWithFiltersInstance
  >()
  const [, , clearToolbar] = useRelatableToolbarContext()
  const onSelectionClear = useCallback(() => {
    const selectedRows = filter(rows, 'isSelected')

    clearToolbar()
    onCustomSelectionChange(selectedRows, false)
  }, [onCustomSelectionChange, rows])

  return (
    <div className="relatable__toolbar-popup relatable__toolbar-selection-popup">
      <Form className="relatable__toolbar-selection-form">
        <h4>You have selected {selectedRowIds.length} rows</h4>
        <Form.Group>
          <Button
            basic
            icon
            color="black"
            title="Clear selection"
            type="button"
            onClick={onSelectionClear}
          >
            <Icon name="remove" /> Clear
          </Button>
        </Form.Group>
      </Form>
    </div>
  )
}
