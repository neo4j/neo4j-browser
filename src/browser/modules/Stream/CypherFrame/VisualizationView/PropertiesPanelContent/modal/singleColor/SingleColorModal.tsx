import * as React from 'react'
import { PhotoshopPicker } from 'react-color'
import styled from 'styled-components'

import GenericModal from '../GenericModal'
import { ApplyButton, StyledDivMarginTopBottom } from '../styled'

interface IProps {
  color: string
  onAccept: (color: string) => void
}
const SingleColorModal: React.FC<IProps> = props => {
  const [open, setOpen] = React.useState(false)
  const doOpen = React.useCallback(() => setOpen(true), [])
  const doClose = React.useCallback(() => setOpen(false), [])
  return (
    <StyledDivMarginTopBottom>
      <ApplyButton onClick={doOpen} backgroundColor={'#5ba823'}>
        Single Color
      </ApplyButton>
      {open && <SingleColorModalBody doClose={doClose} {...props} />}
    </StyledDivMarginTopBottom>
  )
}
const Wrapper = styled.div`
  color: black;
`
const SingleColorModalBody: React.FC<IProps & { doClose: () => void }> = ({
  color,
  onAccept,
  doClose
}) => {
  const [currentColor, setCurrentColor] = React.useState(color)
  return (
    <GenericModal
      isOpen={true}
      onRequestClose={doClose}
      contentLabel={'Pick Color'}
    >
      <Wrapper>
        <PhotoshopPicker
          color={currentColor}
          onChange={React.useCallback(colors => {
            setCurrentColor(colors.hex)
          }, [])}
          onAccept={React.useCallback(() => {
            onAccept(currentColor)
            doClose()
          }, [currentColor, onAccept, doClose])}
          onCancel={doClose}
        />
      </Wrapper>
    </GenericModal>
  )
}
export default SingleColorModal
