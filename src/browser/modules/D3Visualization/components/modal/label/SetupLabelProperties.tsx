import * as React from 'react'
import styled from 'styled-components'

interface IProps {
  propertyKeys: string[]
  selectedCaption: string
  onChange: (value: string) => void
}

const PropertyLabel = styled.label`
  display: block;
  vertical-align: middle;
  cursor: pointer;
  margin: 5px 0;
`
const PropertyRadio = styled.input`
  vertical-align: middle;
`
const PropertyLabelSpan = styled.span<{ underline?: boolean }>`
  vertical-align: middle;
  margin-left: 5px;
  font-weight: bold;

  ${({ underline }) => (underline ? 'text-decoration: underline' : '')}
`
const SetupLabelProperties: React.FC<IProps> = ({
  propertyKeys,
  selectedCaption,
  onChange
}) => {
  const items: Array<{
    displayValue: string
    captionToSave: string
  }> = React.useMemo(
    () =>
      propertyKeys.map(t => ({
        displayValue: t,
        captionToSave: `{${t}}`
      })),
    [propertyKeys]
  )

  const handleRadioInputChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value)
    },
    [onChange]
  )
  const inputName = 'property'
  return (
    <div>
      <PropertyLabel>
        <PropertyRadio
          type={'radio'}
          name={inputName}
          value={''}
          checked={'' === selectedCaption}
          onChange={handleRadioInputChange}
        />
        <PropertyLabelSpan underline={true}>Display nothing</PropertyLabelSpan>
      </PropertyLabel>
      {items.map(({ displayValue, captionToSave }) => (
        <PropertyLabel key={displayValue}>
          <PropertyRadio
            type={'radio'}
            name={inputName}
            value={captionToSave}
            checked={displayValue === selectedCaption}
            onChange={handleRadioInputChange}
          />
          <PropertyLabelSpan>{displayValue}</PropertyLabelSpan>
        </PropertyLabel>
      ))}
    </div>
  )
}

export default SetupLabelProperties
