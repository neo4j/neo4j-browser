import * as React from 'react'
import GenericModal from 'browser/modules/D3Visualization/components/modal/GenericModal'
import styled from 'styled-components'
import SetupLabelProperties from 'project-root/src/browser/modules/D3Visualization/components/modal/label/SetupLabelProperties'
import { camelCase, cloneDeep } from 'lodash-es'
import { ApplyButton, SimpleButton } from '../styled'
import SetupLabelDisplaySettings, {
  ISetupLabelDisplaySettingsOnChange,
  setupLabelDisplaySettingsOptions
} from 'project-root/src/browser/modules/D3Visualization/components/modal/label/SetupLabelDisplaySettings'

const SetupLabelButton = styled.button`
  padding: 2px 4px;
`
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
  updateStyle: (style: ICaptionSettings) => void
}

const SetupLabelModal: React.FC<IProps> = props => {
  const {
    selector,
    propertyKeys,
    itemStyle,
    updateStyle,
    captionSettings
  } = props
  const [open, setOpen] = React.useState(false)
  const doOpen = React.useCallback(() => setOpen(true), [])
  const doClose = React.useCallback(() => setOpen(false), [])
  const [selectedLabel, setSelectedLabel] = React.useState(LabelPosition.middle)
  const title = selector.classes[0] ?? selector.tag
  // const caption = React.useMemo(() => {
  //   return itemStyle.caption.replace(/[{}]/g, '')
  // }, [itemStyle.caption])
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

  const [currentCaptionSettings, setCurrentCaptionSettings] = React.useState<
    ICaptionSettings
  >(() => {
    if (captionSettings) {
      return cloneDeep(captionSettings)
    } else {
      return {
        [LabelPosition.top]: {},
        [LabelPosition.middle]: cloneDeep(itemStyle),
        [LabelPosition.bottom]: {}
      }
    }
  })
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
  console.log(props, currentCaptionSettings)
  return (
    <div>
      <SetupLabelButton onClick={doOpen}>Setup Label</SetupLabelButton>
      <GenericModal
        isOpen={open}
        onRequestClose={doClose}
        contentLabel={'Label setup'}
      >
        <PreviewNodeContainer
          backgroundColor={itemStyle.color}
          borderColor={itemStyle['border-color']}
          textColor={itemStyle['text-color-internal']}
        >
          {allLabelPositions.map(position => (
            <PreviewLabel
              onClick={setSelectedLabel}
              selectedLabel={selectedLabel}
              position={position}
              style={currentCaptionSettings[position]}
              key={position}
            >
              {displayCaption(currentCaptionSettings[position])}
            </PreviewLabel>
          ))}
        </PreviewNodeContainer>
        <RightColumn>
          <h4>{title}</h4>
          <div>{labelHeader}</div>
          <SetupLabelDisplaySettings
            itemStyle={currentCaptionSettings[selectedLabel]}
            onChange={handleDisplaySettingsChange}
          />
        </RightColumn>
        <SetupLabelProperties
          propertyKeys={propertyKeys}
          selectedCaption={displayCaption(
            currentCaptionSettings[selectedLabel]
          )}
          onChange={handleRadioInputChange}
        />
        <MarginContainer>
          <ApplyButton onClick={handleApply}>Apply</ApplyButton>
          <SimpleButton onClick={doClose}>Cancel</SimpleButton>
        </MarginContainer>
      </GenericModal>
    </div>
  )
}
const PreviewLabel: React.FC<{
  selectedLabel: LabelPosition
  position: LabelPosition
  onClick: (position: LabelPosition) => void
  style: {
    [key: string]: string
  }
}> = ({ selectedLabel, position, onClick, style, children }) => {
  const includePropertyKey = 'include-property-name'
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
        if (includePropertyKey !== option.key) {
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
      {children && (
        <span style={textStyle}>
          {children}
          {style[includePropertyKey] ? ': value' : ''}
        </span>
      )}
    </PreviewLabelButton>
  )
}
export default SetupLabelModal
