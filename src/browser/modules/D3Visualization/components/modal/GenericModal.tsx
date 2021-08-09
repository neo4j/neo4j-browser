import * as React from 'react'
import Modal from 'react-modal'

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)'
  }
}

const GenericModal: React.FC<Modal.Props> = ({ children, ...props }) => (
  <Modal style={customStyles} {...props}>
    {children}
  </Modal>
)

export default GenericModal
