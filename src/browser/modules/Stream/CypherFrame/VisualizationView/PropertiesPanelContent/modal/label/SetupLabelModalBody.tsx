import * as React from 'react'
import styled from 'styled-components'
import SetupLabelDisplaySettings, {
  includePropertyNameKey,
  ISetupLabelDisplaySettingsOnChange
} from './SetupLabelDisplaySettings'
import {
  allLabelPositions,
  ICaptionSettings,
  LabelPosition
} from './SetupLabelModal'
import SetupLabelProperties, {
  idSelectorValue,
  typeSelectorValue
} from './SetupLabelProperties'
import SetupLabelPreviewLabel from './SetupLabelPreviewLabel'
import { ApplyButton, SimpleButton } from '../styled'
import { ISetupLabelStorageProps } from './SetupLabelStorage'

const PreviewNodeContainer = styled.div<{
  backgroundColor?: string
  borderColor?: string
  textColor?: string
}>`
  border-radius: 50%;
  padding: 30px 0;
  border: 5px solid ${({ borderColor }) => borderColor ?? 'limegreen'};
  background-color: ${({ backgroundColor }) => backgroundColor ?? 'inherit'};
  color: ${({ textColor }) => textColor ?? 'inherit'};
  width: 150px;
  height: 150px;
  text-align: center;
  display: inline-block;
  vertical-align: top;
`
const PreviewRelContainer = styled.div`
  margin-top: 50px;
  padding: 30px 0;
  text-align: center;
  display: inline-block;
  vertical-align: top;
  width: 150px;
`
const RightColumn = styled.div`
  display: inline-block;
  vertical-align: top;
  margin-left: 20px;
`
const MarginContainer = styled.div`
  margin-top: 30px;
`
type IUpdateCaptionSettingsStoreFn = (props: {
  position: LabelPosition
  key: string
  value: string | null
}) => void
interface ISetupLabelModalProps
  extends Omit<ISetupLabelStorageProps, 'itemStyleProps' | 'updateStyle'> {
  onSubmit: () => void
  onReset: () => void
  captionSettings: ICaptionSettings
  onUpdate: IUpdateCaptionSettingsStoreFn
}
export const PREFERRED_LABEL_KEY = 'preferred-label'
const SetupLabelModalBody: React.FC<ISetupLabelModalProps> = props => {
  const {
    selector,
    propertyKeys,
    captionSettings,
    onSubmit,
    onReset,
    doClose,
    onUpdate,
    showTypeSelector,
    isNode,
    typeList
  } = props

  const [selectedLabel, setSelectedLabel] = React.useState(LabelPosition.middle)
  const title = selector.classes[0] ?? selector.tag

  const labelHeader = React.useMemo(() => {
    switch (selectedLabel) {
      case LabelPosition.top:
        return 'Top label'
      case LabelPosition.middle:
        return 'Middle label'
      case LabelPosition.bottom:
        return 'Bottom label'
    }
  }, [selectedLabel])

  const handleRadioInputChange = React.useCallback(
    (caption: string) =>
      onUpdate({
        position: selectedLabel,
        key: 'caption',
        value: caption
      }),
    [selectedLabel, onUpdate]
  )

  const handleTypeChange = React.useCallback(
    (value: string) =>
      onUpdate({
        position: selectedLabel,
        key: PREFERRED_LABEL_KEY,
        value
      }),
    [selectedLabel, onUpdate]
  )

  const handleDisplaySettingsChange: ISetupLabelDisplaySettingsOnChange =
    React.useCallback(
      ({ key, value }) => {
        onUpdate({
          position: selectedLabel,
          key,
          value
        })
      },
      [selectedLabel, onUpdate]
    )
  const labelsNodes = allLabelPositions.map(position => (
    <SetupLabelPreviewLabel
      onClick={setSelectedLabel}
      selectedLabel={selectedLabel}
      position={position}
      style={captionSettings[position]}
      text={captionSettings[position].caption}
      key={position}
    />
  ))

  const currentCaption: string | undefined =
    captionSettings[selectedLabel].caption
  const isCustom = React.useMemo(() => {
    if (currentCaption) {
      return !propertyKeys
        .concat([idSelectorValue, typeSelectorValue])
        .includes(currentCaption.replace(/[{}]/g, ''))
    } else {
      return true
    }
  }, [currentCaption, propertyKeys])
  React.useEffect(() => {
    if (isCustom) {
      handleDisplaySettingsChange({ key: includePropertyNameKey, value: null })
    }
  }, [isCustom, handleDisplaySettingsChange])
  let nodeOrRelDiv
  if (isNode) {
    nodeOrRelDiv = (
      <PreviewNodeContainer
        backgroundColor={captionSettings[selectedLabel].color}
        borderColor={captionSettings[selectedLabel]['border-color']}
        textColor={captionSettings[selectedLabel]['text-color-internal']}
      >
        {labelsNodes}
      </PreviewNodeContainer>
    )
  } else {
    nodeOrRelDiv = (
      <PreviewRelContainer>
        {/*<SetupLabelRelArrowSVG position={selectedRelPosition} setPosition={setRelPosition}/>*/}
        {labelsNodes}
      </PreviewRelContainer>
    )
  }
  return (
    <div>
      {nodeOrRelDiv}
      <RightColumn>
        <h4>{title}</h4>
        <div>{labelHeader}</div>
        <SetupLabelDisplaySettings
          isCustom={isCustom}
          itemStyle={captionSettings[selectedLabel]}
          onChange={handleDisplaySettingsChange}
        />
      </RightColumn>
      <SetupLabelProperties
        showTypeSelector={showTypeSelector}
        propertyKeys={propertyKeys}
        selectedCaption={currentCaption}
        onChange={handleRadioInputChange}
        typeList={typeList}
        handleTypeChange={handleTypeChange}
        currentType={captionSettings[selectedLabel][PREFERRED_LABEL_KEY]}
      />
      <MarginContainer>
        <ApplyButton onClick={onSubmit}>Apply</ApplyButton>
        <SimpleButton onClick={doClose}>Cancel</SimpleButton>
        <SimpleButton onClick={onReset}>Reset to default</SimpleButton>
      </MarginContainer>
    </div>
  )
}

export default SetupLabelModalBody
