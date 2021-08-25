import * as React from 'react'
import {
  includePropertyNameKey,
  setupLabelDisplaySettingsOptions
} from 'project-root/src/browser/modules/D3Visualization/components/modal/label/SetupLabelDisplaySettings'
import { camelCase } from 'lodash-es'
import { LabelPosition } from 'project-root/src/browser/modules/D3Visualization/components/modal/label/SetupLabelModal'
import styled from 'styled-components'

const PreviewLabelButton = styled.button<{ isSelected?: boolean }>`
  display: block;
  margin: 5px auto;
  width: 100px;
  min-height: 20px;
  background-color: rgba(255, 255, 255, 0.2);
  border: ${({ isSelected }) =>
    isSelected
      ? '2px dashed rgba(255, 255, 255, 1)'
      : '1px dashed rgba(255, 255, 255, 0.6)'};
`

const SetupLabelPreviewLabel: React.FC<{
  selectedLabel: LabelPosition
  position: LabelPosition
  onClick: (position: LabelPosition) => void
  text?: string
  style: {
    [key: string]: string
  }
}> = ({ selectedLabel, position, onClick, style, text }) => {
  const handleClick = React.useCallback(() => onClick(position), [
    onClick,
    position
  ])
  const textStyle: { [p: string]: string } = React.useMemo(() => {
    const result: {
      [key: string]: string
    } = {}
    setupLabelDisplaySettingsOptions.forEach(option => {
      if (style[option.key]) {
        if (includePropertyNameKey !== option.key) {
          result[camelCase(option.key)] = option.value
        }
      }
    })
    return result
  }, [style])
  return (
    <PreviewLabelButton
      isSelected={selectedLabel === position}
      onClick={handleClick}
    >
      {text && (
        <span style={textStyle}>
          {style[includePropertyNameKey]
            ? text.replace(/[{}]/g, '') + ': '
            : ''}
          {text}
        </span>
      )}
    </PreviewLabelButton>
  )
}

export default SetupLabelPreviewLabel
