import * as React from 'react'
import GenericModal from './GenericModal'
import styled from 'styled-components'
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
  ${({ isSelected }) => (isSelected ? `font-weight: bold` : '')}
`

interface IProps {
  selector: {
    classes: string[]
    tag: string
  }
  styleForItem: any
  propertyKeys: any
  updateStyle: (selector: any, props: any) => void
}
enum LabelPosition {
  top,
  middle,
  bottom
}
const SetupLabelModal: React.FC<IProps> = props => {
  const { selector } = props
  const [open, setOpen] = React.useState(false)
  const doOpen = React.useCallback(() => setOpen(true), [])
  const doClose = React.useCallback(() => setOpen(false), [])
  const [selectedLabel, setSelectedLabel] = React.useState(LabelPosition.middle)
  const title = selector.classes[0] ?? selector.tag
  console.log(props)
  return (
    <div>
      <SetupLabelButton onClick={doOpen}>Setup Label</SetupLabelButton>
      <GenericModal
        isOpen={open}
        onRequestClose={doClose}
        contentLabel={'Label setup'}
      >
        <h4>{title}</h4>
        <PreviewNodeContainer>
          <PreviewLabel
            onClick={setSelectedLabel}
            selectedLabel={selectedLabel}
            position={LabelPosition.top}
          />
          <PreviewLabel
            onClick={setSelectedLabel}
            selectedLabel={selectedLabel}
            position={LabelPosition.middle}
          />
          <PreviewLabel
            onClick={setSelectedLabel}
            selectedLabel={selectedLabel}
            position={LabelPosition.bottom}
          />
        </PreviewNodeContainer>
      </GenericModal>
    </div>
  )
}
const PreviewLabel: React.FC<{
  selectedLabel: LabelPosition
  position: LabelPosition
  onClick: (position: LabelPosition) => void
}> = ({ selectedLabel, position, onClick }) => {
  const handleClick = React.useCallback(() => onClick(position), [
    onClick,
    position
  ])
  return (
    <PreviewLabelButton
      isSelected={selectedLabel === position}
      onClick={handleClick}
    >
      caption
    </PreviewLabelButton>
  )
}
export default SetupLabelModal
