import * as React from 'react'
import Modal from 'react-modal'
import styled from 'styled-components'

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    padding: 0,
    backgroundColor: 'inherit',
    border: '1px solid rgba(0,0,0,0.2)',
    boxShadow: '2px 2px 2px 1px rgba(0, 0, 0, 0.2)',
    maxWidth: '70%'
  }
}
const ModalBody = styled.div`
  background-color: ${({ theme }) => theme.primaryBackground};
  color: ${({ theme }) => theme.primaryText};
  padding: 20px;
`
const GenericModal: React.FC<Modal.Props> = ({ children, ...props }) => (
  <Modal style={customStyles} {...props}>
    <ModalBody>{children}</ModalBody>
  </Modal>
)

export default GenericModal
