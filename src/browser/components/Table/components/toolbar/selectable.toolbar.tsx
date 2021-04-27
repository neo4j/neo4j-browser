import React, { useCallback } from 'react'
import { Button, Form, Icon, Label, Menu } from 'semantic-ui-react'
import { entries, filter, head, map } from 'lodash-es'

import {
  useRelatableStateContext,
  useRelatableToolbarContext
} from '../../states'
import { getToolbarStateClass } from '../../utils/relatable-state-classes'
import {
  IWithFiltersInstance,
  IWithSelectionInstance,
  withSelection
} from '../../add-ons'

import { ToolbarPopup } from './toolbar-popup'
import arrayHasItems from '../../utils/array-has-items'

export default function SelectableToolbar() {
  const {
    selectedFlatRows,
    state: { selectedRowIds }
  } = useRelatableStateContext<any, IWithSelectionInstance>()
  const [
    selectedToolbarAction,
    setToolbar,
    clearToolbar
  ] = useRelatableToolbarContext()
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
