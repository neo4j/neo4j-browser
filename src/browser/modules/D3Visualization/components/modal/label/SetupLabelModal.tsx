import * as React from 'react'
import GenericModal from 'browser/modules/D3Visualization/components/modal/GenericModal'
import styled from 'styled-components'
import SetupLabelProperties from 'project-root/src/browser/modules/D3Visualization/components/modal/label/SetupLabelProperties'
import { cloneDeep } from 'lodash-es'
import { ApplyButton, SimpleButton } from '../styled'

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
  height: 20px;
  background-color: rgba(255, 255, 255, 0.2);
  border: 1px dashed rgba(255, 255, 255, 0.6);
  ${({ isSelected }) => (isSelected ? `font-weight: bold` : '')}
`

const RightColumn = styled.div`
  display: inline-block;
  vertical-align: top;
  margin-left: 20px;
`
const MarginContainer = styled.div`
  margin-top: 30px;
`
enum LabelPosition {
  top,
  middle,
  bottom
}

const allLabelPositions: LabelPosition[] = [
  LabelPosition.top,
  LabelPosition.middle,
  LabelPosition.bottom
]

interface ICurrentCaption {
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
  itemStyle: {
    caption: string
    'border-color': string
    'border-width': string
    color: string
    diameter: string
    'font-size': string
    'text-color-internal': string
    [key: string]: string
  }
  propertyKeys: string[]
  updateStyle: (selector: any, props: any) => void
}

const SetupLabelModal: React.FC<IProps> = props => {
  const { selector, propertyKeys, itemStyle, updateStyle } = props
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
    ICurrentCaption
  >({
    [LabelPosition.top]: {},
    [LabelPosition.middle]: cloneDeep(itemStyle),
    [LabelPosition.bottom]: {}
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
    } else if (amountOfCaptions === 1) {
      const caption = allLabelPositions
        .map(position => currentCaptionSettings[position].caption)
        .find(t => t != undefined)
      updateStyle(selector, { caption })
      doClose()
    } else {
      doClose()
    }
  }, [doClose, currentCaptionSettings])
  console.log(props, itemStyle)
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
              key={position}
            >
              {displayCaption(currentCaptionSettings[position])}
            </PreviewLabel>
          ))}
        </PreviewNodeContainer>
        <RightColumn>
          <h4>{title}</h4>
          <div>{labelHeader}</div>
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
}> = ({ selectedLabel, position, onClick, children }) => {
  const handleClick = React.useCallback(() => onClick(position), [
    onClick,
    position
  ])
  return (
    <PreviewLabelButton
      isSelected={selectedLabel === position}
      onClick={handleClick}
    >
      {children}
    </PreviewLabelButton>
  )
}
export default SetupLabelModal
