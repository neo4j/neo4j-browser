import * as React from 'react'
import styled from 'styled-components'

import SetupLabelCompositeProperty from 'project-root/src/browser/modules/D3Visualization/components/modal/label/SetupLabelCompositeProperty'
import SetupLabelTypeSelector from 'project-root/src/browser/modules/D3Visualization/components/modal/label/SetupLabelTypeSelector'

interface IProps {
  propertyKeys: string[]
  selectedCaption?: string
  onChange: (value: string) => void
  showTypeSelector: boolean
  typeList: string[]
  handleTypeChange: (value: string) => void
  currentType?: string
}

const ScrollDiv = styled.div`
  max-height: 250px;
  overflow-y: auto;
`
const PropertyLabel = styled.label`
  display: block;
  vertical-align: middle;
  cursor: pointer;
  margin-bottom: 5px;
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
const TabContainer = styled.div``
const Tab = styled.div<{ active: boolean }>`
  display: inline-block;
  border-radius: 2px 2px 0 0;
  border: 1px solid #0c3246;
  padding: 5px 10px;
  cursor: pointer;
  font-size: 110%;
  ${({ active }) =>
    active
      ? `
  border-bottom: 1px solid transparent;
  `
      : ''}
`

const BorderDiv = styled.div`
  border-left: 1px solid #0c3246;
  border-bottom: 1px solid #0c3246;
  padding-left: 5px;
  padding-bottom: 10px;
`
export const typeSelectorValue = '<type>'
export const idSelectorValue = '<id>'

enum SetupLabelTabEnum {
  list,
  custom
}

const SetupLabelProperties: React.FC<IProps> = ({
  propertyKeys,
  selectedCaption,
  onChange,
  showTypeSelector,
  typeList,
  handleTypeChange,
  currentType
}) => {
  const [tab, setTab] = React.useState(SetupLabelTabEnum.list)
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
  const handleTypeInputChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value)
      if (typeList.length > 0) {
        handleTypeChange(currentType ?? typeList[0])
      }
    },
    [onChange, typeList, currentType, handleTypeChange]
  )
  const handleCompositeFieldSelect = React.useCallback(
    (value: string) => {
      onChange(value)
    },
    [onChange]
  )
  const inputName = 'property'
  const specialProperties: string[] = React.useMemo(() => {
    return showTypeSelector
      ? [idSelectorValue, typeSelectorValue]
      : [idSelectorValue]
  }, [showTypeSelector])

  const allProperties: string[] = React.useMemo(
    () => specialProperties.concat(propertyKeys),
    [specialProperties, propertyKeys]
  )
  return (
    <div>
      <TabContainer>
        <Tab
          active={tab === SetupLabelTabEnum.list}
          onClick={() => setTab(SetupLabelTabEnum.list)}
        >
          List
        </Tab>
        <Tab
          active={tab === SetupLabelTabEnum.custom}
          onClick={() => setTab(SetupLabelTabEnum.custom)}
        >
          Custom
        </Tab>
      </TabContainer>
      <ScrollDiv>
        {tab === SetupLabelTabEnum.list ? (
          <BorderDiv>
            <PropertyLabel>
              <PropertyRadio
                type={'radio'}
                name={inputName}
                value={''}
                checked={'' === selectedCaption}
                onChange={handleRadioInputChange}
              />
              <PropertyLabelSpan underline={true}>
                Display nothing
              </PropertyLabelSpan>
            </PropertyLabel>
            <PropertyLabel key={idSelectorValue}>
              <PropertyRadio
                type={'radio'}
                name={inputName}
                value={`{${idSelectorValue}}`}
                checked={`{${idSelectorValue}}` === selectedCaption}
                onChange={handleRadioInputChange}
              />
              <PropertyLabelSpan>{idSelectorValue}</PropertyLabelSpan>
            </PropertyLabel>
            {showTypeSelector && (
              <PropertyLabel key={typeSelectorValue}>
                <PropertyRadio
                  type={'radio'}
                  name={inputName}
                  value={`{${typeSelectorValue}}`}
                  checked={`{${typeSelectorValue}}` === selectedCaption}
                  onChange={handleTypeInputChange}
                />
                <PropertyLabelSpan>
                  {typeSelectorValue}
                  {typeList.length > 0 && (
                    <SetupLabelTypeSelector
                      typeList={typeList}
                      handleTypeChange={handleTypeChange}
                      currentType={currentType}
                    />
                  )}
                </PropertyLabelSpan>
              </PropertyLabel>
            )}
            {items.map(({ displayValue, captionToSave }) => (
              <PropertyLabel key={displayValue}>
                <PropertyRadio
                  type={'radio'}
                  name={inputName}
                  value={captionToSave}
                  checked={captionToSave === selectedCaption}
                  onChange={handleRadioInputChange}
                />
                <PropertyLabelSpan>{displayValue}</PropertyLabelSpan>
              </PropertyLabel>
            ))}
          </BorderDiv>
        ) : (
          <BorderDiv>
            <SetupLabelCompositeProperty
              onSelect={handleCompositeFieldSelect}
              properties={allProperties}
              selectedCaption={selectedCaption ?? ''}
            />
          </BorderDiv>
        )}
      </ScrollDiv>
    </div>
  )
}

export default SetupLabelProperties
