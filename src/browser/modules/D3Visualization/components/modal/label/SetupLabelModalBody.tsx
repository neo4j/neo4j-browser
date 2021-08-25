import * as React from 'react'
import { cloneDeep } from 'lodash-es'
import SetupLabelDisplaySettings, {
  includePropertyNameKey,
  ISetupLabelDisplaySettingsOnChange
} from 'project-root/src/browser/modules/D3Visualization/components/modal/label/SetupLabelDisplaySettings'
import SetupLabelProperties, {
  idSelectorValue,
  typeSelectorValue
} from 'project-root/src/browser/modules/D3Visualization/components/modal/label/SetupLabelProperties'
import {
  ApplyButton,
  SimpleButton
} from 'project-root/src/browser/modules/D3Visualization/components/modal/styled'
import {
  allLabelPositions,
  ICaptionSettings,
  LabelPosition
} from 'project-root/src/browser/modules/D3Visualization/components/modal/label/SetupLabelModal'
import { ISetupLabelStorageProps } from 'project-root/src/browser/modules/D3Visualization/components/modal/label/SetupLabelStorage'
import SetupLabelPreviewLabel from 'project-root/src/browser/modules/D3Visualization/components/modal/label/SetupLabelPreviewLabel'
import styled from 'styled-components'

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
    isNode
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

  const handleDisplaySettingsChange: ISetupLabelDisplaySettingsOnChange = React.useCallback(
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
