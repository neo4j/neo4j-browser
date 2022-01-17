import * as React from 'react'
import styled from 'styled-components'

interface IProps {
  typeList: string[]
  handleTypeChange: (value: string) => void
  currentType?: string
}
function SetupLabelTypeSelector({
  typeList,
  currentType,
  handleTypeChange
}: IProps) {
  return (
    <TransparentSelect
      value={currentType}
      onChange={React.useCallback(
        e => {
          handleTypeChange(e.target.value)
        },
        [handleTypeChange]
      )}
    >
      {typeList.map(t => (
        <option value={t} key={t}>
          {t}
        </option>
      ))}
    </TransparentSelect>
  )
}
const TransparentSelect = styled.select`
  background: transparent;
  margin-left: 10px;
`
export default SetupLabelTypeSelector
