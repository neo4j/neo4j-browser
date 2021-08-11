import * as React from 'react'
import styled from 'styled-components'

interface IProps {
  propertyKeys: string[]
  selectedCaption: string
  onChange: (value: string) => void
  showTypeSelector: boolean
}
const ScrollDiv = styled.div`
  max-height: 250px;
  overflow-y: auto;
`
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
const typeSelectorValue = '<type>'
const idSelectorValue = '<id>'

const SetupLabelProperties: React.FC<IProps> = ({
  propertyKeys,
  selectedCaption,
  onChange,
  showTypeSelector
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
    <ScrollDiv>
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
      <PropertyLabel>
        <PropertyRadio
          type={'radio'}
          name={inputName}
          value={idSelectorValue}
          checked={idSelectorValue === selectedCaption}
          onChange={handleRadioInputChange}
        />
        <PropertyLabelSpan>{idSelectorValue}</PropertyLabelSpan>
      </PropertyLabel>
      {showTypeSelector && (
        <PropertyLabel>
          <PropertyRadio
            type={'radio'}
            name={inputName}
            value={typeSelectorValue}
            checked={typeSelectorValue === selectedCaption}
            onChange={handleRadioInputChange}
          />
          <PropertyLabelSpan>{typeSelectorValue}</PropertyLabelSpan>
        </PropertyLabel>
      )}
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
    </ScrollDiv>
  )
}

export default SetupLabelProperties
