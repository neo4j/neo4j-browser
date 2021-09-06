import * as React from 'react'
import GenericModal from './GenericModal'
interface IProps {
  isOpen: boolean
  onClose: () => void
}
const GraphLayoutModal: React.FC<IProps> = ({ isOpen, onClose }) => (
  <GenericModal isOpen={isOpen} onRequestClose={onClose}>
    hello there layout
  </GenericModal>
)

export default GraphLayoutModal
