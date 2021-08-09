import * as React from 'react'
import GenericModal from 'browser/modules/D3Visualization/components/modal/GenericModal'
import styled from 'styled-components'
import SetupLabelProperties from 'project-root/src/browser/modules/D3Visualization/components/modal/label/SetupLabelProperties'
import { cloneDeep } from 'lodash-es'

const SetupLabelButton = styled.button`
  padding: 2px 4px;
`
const PreviewNodeContainer = styled.div`
  border-radius: 50%;
  padding: 30px 0;
  border: 5px solid limegreen;
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
  ${({ isSelected }) => (isSelected ? `font-weight: bold` : '')}
`

const RightColumn = styled.div`
  display: inline-block;
  vertical-align: top;
  margin-left: 20px;
`

enum LabelPosition {
  top,
  middle,
  bottom
}

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

  console.log(props)
  return (
    <div>
      <SetupLabelButton onClick={doOpen}>Setup Label</SetupLabelButton>
      <GenericModal
        isOpen={open}
        onRequestClose={doClose}
        contentLabel={'Label setup'}
      >
        <PreviewNodeContainer>
          {[LabelPosition.top, LabelPosition.middle, LabelPosition.bottom].map(
            position => (
              <PreviewLabel
                onClick={setSelectedLabel}
                selectedLabel={selectedLabel}
                position={position}
                key={position}
              >
                {displayCaption(currentCaptionSettings[position])}
              </PreviewLabel>
            )
          )}
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
