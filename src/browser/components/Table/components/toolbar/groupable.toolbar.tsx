import React, { useCallback, useState } from 'react'
import { Button, Divider, Form, Icon, Label, Menu } from 'semantic-ui-react'
import { FormSelect } from 'semantic-ui-react'
import { filter, find, get, head, map } from 'lodash-es'

import { RELATABLE_ICONS } from '../../relatable.types'

import {
  useRelatableStateContext,
  useRelatableToolbarContext
} from '../../states'
import arrayHasItems from '../../utils/array-has-items'
import { getToolbarStateClass } from '../../utils/relatable-state-classes'
import { IWithGroupingInstance, withGrouping } from '../../add-ons'
import { getRelatableAction } from '../../utils/relatable-actions'
import { columnHasAction } from '../../utils/column-actions'

import { ToolbarPopup } from './toolbar-popup'
import RelatableIcon from '../relatable-icon'

export default function GroupableToolbar() {
  const {
    allColumns: columns,
    state: { groupBy },
    onCustomGroupingChange
  } = useRelatableStateContext<any, IWithGroupingInstance>()
  const [
    selectedToolbarAction,
    setToolbar,
    clearToolbar
  ] = useRelatableToolbarContext()
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
