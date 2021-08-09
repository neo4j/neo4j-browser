import * as React from 'react'
import GenericModal from './GenericModal'
import styled from 'styled-components'
const SetupLabelButton = styled.button`
  padding: 2px 4px;
`
const PreviewNodeContainer = styled.div`
  border-radius: 50%;
  padding: 25px 0;
  border: 5px solid limegreen;
  width: 150px;
  height: 150px;
  text-align: center;
  display: inline-block;
  vertical-align: top;
`
const PreviewLabelButton = styled.button`
  display: block;
  margin: 5px auto;
  width: 100px;
`
interface IProps {
  selector: any
  styleForItem: any
  propertyKeys: any
  updateStyle: (selector: any, props: any) => void
}
const SetupLabelModal: React.FC<IProps> = props => {
  const [open, setOpen] = React.useState(false)
  const doOpen = React.useCallback(() => setOpen(true), [])
  const doClose = React.useCallback(() => setOpen(false), [])
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
          <PreviewLabelButton>Top label</PreviewLabelButton>
          <PreviewLabelButton>Middle label</PreviewLabelButton>
          <PreviewLabelButton>Bottom label</PreviewLabelButton>
        </PreviewNodeContainer>
      </GenericModal>
    </div>
  )
}

export default SetupLabelModal
