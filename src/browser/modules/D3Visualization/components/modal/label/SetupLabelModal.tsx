import * as React from 'react'
import GenericModal from 'browser/modules/D3Visualization/components/modal/GenericModal'
import styled from 'styled-components'
import SetupLabelProperties from 'project-root/src/browser/modules/D3Visualization/components/modal/label/SetupLabelProperties'
import { camelCase, cloneDeep } from 'lodash-es'
import { ApplyButton, SimpleButton } from '../styled'
import SetupLabelDisplaySettings, {
  includePropertyNameKey,
  ISetupLabelDisplaySettingsOnChange,
  setupLabelDisplaySettingsOptions
} from 'project-root/src/browser/modules/D3Visualization/components/modal/label/SetupLabelDisplaySettings'
import SetupLabelRelArrowSVG from 'project-root/src/browser/modules/D3Visualization/components/modal/label/SetupLabelRelArrowSVG'

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
  padding: 30px 0;
  text-align: center;
  display: inline-block;
  vertical-align: top;
  width: 150px;
  height: 150px;
`
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
//   ${({ isSelected }) => (isSelected ? `font-weight: bold` : '')}
const RightColumn = styled.div`
  display: inline-block;
  vertical-align: top;
  margin-left: 20px;
`
const MarginContainer = styled.div`
  margin-top: 30px;
`

export enum LabelPosition {
  top,
  middle,
  bottom
}

export const allLabelPositions: LabelPosition[] = [
  LabelPosition.top,
  LabelPosition.middle,
  LabelPosition.bottom
]

export interface ICaptionSettings {
  [LabelPosition.top]: ICurrentCaptionItem
  [LabelPosition.middle]: ICurrentCaptionItem
  [LabelPosition.bottom]: ICurrentCaptionItem
}

interface ICurrentCaptionItem {
  [key: string]: string
}

interface IProps {
  selector: {
    classes: string[]
    tag: string
  }
  captionSettings?: ICaptionSettings
  itemStyle: {
    caption: string
    'border-color': string
    'border-width': string
    color: string
    diameter: string
    'font-size': string
    'text-color-internal': string
  }
  propertyKeys: string[]
  showTypeSelector: boolean
  updateStyle: (style?: ICaptionSettings) => void
  isNode: boolean
}

const SetupLabelModalContainer: React.FC<IProps> = props => {
  const [open, setOpen] = React.useState(false)
  const doOpen = React.useCallback(() => setOpen(true), [])
  const doClose = React.useCallback(() => setOpen(false), [])

  return (
    <div>
      <ApplyButton onClick={doOpen}>Setup Label</ApplyButton>
      {open && <SetupLabelModal doClose={doClose} {...props} />}
    </div>
  )
}

const SetupLabelModal: React.FC<IProps & { doClose: () => void }> = props => {
  const {
    selector,
    propertyKeys,
    itemStyle,
    updateStyle,
    captionSettings,
    doClose,
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

  const doReset = React.useCallback(() => {
    updateStyle(undefined)
    doClose()
  }, [updateStyle])

  const getInitialCaptionSettings: () => ICaptionSettings = React.useCallback(() => {
    if (captionSettings) {
      return cloneDeep(captionSettings)
    } else {
      const middle = cloneDeep(itemStyle)
      const top = cloneDeep(itemStyle)
      delete top.caption
      const bottom = cloneDeep(top)
      return {
        [LabelPosition.top]: top,
        [LabelPosition.middle]: middle,
        [LabelPosition.bottom]: bottom
      }
    }
  }, [captionSettings, itemStyle])

  const [currentCaptionSettings, setCurrentCaptionSettings] = React.useState<
    ICaptionSettings
  >(getInitialCaptionSettings())

  const displayCaption: (
    captionSettings: ICurrentCaptionItem
  ) => string = React.useCallback(
    (captionSettings: ICurrentCaptionItem) => {
      return captionSettings.caption?.replace(/[{}]/g, '') ?? ''
    },
    [currentCaptionSettings]
  )

  const handleRadioInputChange = React.useCallback(
    (caption: string) => {
      setCurrentCaptionSettings(t => {
        const cloned = cloneDeep(t)
        if (caption === '') {
          delete cloned[selectedLabel].caption
        } else {
          cloned[selectedLabel].caption = caption
        }
        return cloned
      })
    },
    [selectedLabel, setCurrentCaptionSettings]
  )
  const handleApply = React.useCallback(() => {
    const amountOfCaptions = allLabelPositions.reduce(
      (accumulator: number, currentValue) =>
        currentCaptionSettings[currentValue].caption
          ? accumulator + 1
          : accumulator,
      0
    )
    if (amountOfCaptions === 0) {
      alert('Node needs to have at least one label set')
    } else {
      updateStyle(currentCaptionSettings)
      doClose()
    }
  }, [doClose, currentCaptionSettings, updateStyle])

  const handleDisplaySettingsChange: ISetupLabelDisplaySettingsOnChange = React.useCallback(
    ({ key, value }) => {
      setCurrentCaptionSettings(old => {
        const cloned = cloneDeep(old)
        if (value === null) {
          delete cloned[selectedLabel][key]
        } else {
          cloned[selectedLabel][key] = value
        }
        return cloned
      })
    },
    [selectedLabel]
  )

  const labelsNodes = allLabelPositions.map(position => (
    <PreviewLabel
      onClick={setSelectedLabel}
      selectedLabel={selectedLabel}
      position={position}
      style={currentCaptionSettings[position]}
      text={currentCaptionSettings[position].caption}
      key={position}
    />
  ))

  const isCustom = React.useMemo(() => {
    const caption = currentCaptionSettings[selectedLabel].caption
    return false
  }, [currentCaptionSettings[selectedLabel].caption])
  let nodeOrRelDiv
  if (isNode) {
    nodeOrRelDiv = (
      <PreviewNodeContainer
        backgroundColor={itemStyle.color}
        borderColor={itemStyle['border-color']}
        textColor={itemStyle['text-color-internal']}
      >
        {labelsNodes}
      </PreviewNodeContainer>
    )
  } else {
    nodeOrRelDiv = (
      <PreviewRelContainer>
        <SetupLabelRelArrowSVG />
        {labelsNodes}
      </PreviewRelContainer>
    )
  }
  return (
    <GenericModal
      isOpen={true}
      onRequestClose={doClose}
      contentLabel={'Label setup'}
    >
      {nodeOrRelDiv}
      <RightColumn>
        <h4>{title}</h4>
        <div>{labelHeader}</div>
        <SetupLabelDisplaySettings
          itemStyle={currentCaptionSettings[selectedLabel]}
          onChange={handleDisplaySettingsChange}
        />
      </RightColumn>
      <SetupLabelProperties
        showTypeSelector={showTypeSelector}
        propertyKeys={propertyKeys}
        selectedCaption={currentCaptionSettings[selectedLabel].caption}
        onChange={handleRadioInputChange}
      />
      <MarginContainer>
        <ApplyButton onClick={handleApply}>Apply</ApplyButton>
        <SimpleButton onClick={doClose}>Cancel</SimpleButton>
        <SimpleButton onClick={doReset}>Reset to default</SimpleButton>
      </MarginContainer>
    </GenericModal>
  )
}
const PreviewLabel: React.FC<{
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
export default SetupLabelModalContainer
