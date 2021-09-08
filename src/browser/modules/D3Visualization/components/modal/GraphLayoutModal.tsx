import * as React from 'react'
import GenericModal from './GenericModal'
import { IGraphLayoutStats } from '../Graph'
import { ApplyButton, SimpleButton } from './styled'
interface IProps {
  isOpen: boolean
  onClose: () => void
  stats: IGraphLayoutStats
  onDirectionalLayoutClick: () => void
}
const GraphLayoutModal: React.FC<IProps> = ({
  isOpen,
  onClose,
  onDirectionalLayoutClick
}) => {
  const handleDirectionalClick = React.useCallback(() => {
    onDirectionalLayoutClick()
    onClose()
  }, [onClose, onDirectionalLayoutClick])
  return (
    <GenericModal isOpen={isOpen} onRequestClose={onClose}>
      <h2>Graph Layout</h2>
      <SimpleButton>Categorized. Group nodes by their type</SimpleButton>
      <SimpleButton onClick={handleDirectionalClick}>
        Directional flow from root node
      </SimpleButton>
      <div>
        <SimpleButton onClick={onClose}>Cancel</SimpleButton>
      </div>
    </GenericModal>
  )
}

export default GraphLayoutModal
