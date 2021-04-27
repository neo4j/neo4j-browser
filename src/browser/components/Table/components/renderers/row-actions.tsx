import React from 'react'
import { Checkbox, Icon } from 'semantic-ui-react'
import { every } from 'lodash-es'

export default function RowActions({
  rows,
  onExpandClick,
  onSelectClick
}: any) {
  return (
    <span className="relatable__table-row-actions">
      {onExpandClick && (
        <span className="relatable__row-expander" onClick={onExpandClick}>
          <Icon
            name={every(rows, 'isExpanded') ? 'caret down' : 'caret right'}
          />
        </span>
      )}
      {onSelectClick && (
        <Checkbox
          className="relatable__row-selector"
          checked={every(rows, 'isSelected')}
          onChange={(_, { checked }) => onSelectClick(checked)}
        />
      )}
    </span>
  )
}
