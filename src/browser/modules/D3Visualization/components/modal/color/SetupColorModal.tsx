import * as React from 'react'

import GenericModal from '../GenericModal'
import { ApplyButton } from '../styled'
import SetupColorStorage, { ISetupColorStorageProps } from './SetupColorStorage'
import { StyledDivMarginTopBottom } from 'project-root/src/browser/modules/D3Visualization/components/styled'

const SetupColorModal: React.FC<
  Omit<ISetupColorStorageProps, 'doClose'>
> = props => {
  const [open, setOpen] = React.useState(false)
  const doOpen = React.useCallback(() => setOpen(true), [])
  const doClose = React.useCallback(() => setOpen(false), [])
  return (
    <StyledDivMarginTopBottom>
      <ApplyButton onClick={doOpen} backgroundColor={'#f76060'}>
        Setup Color
      </ApplyButton>
      {open && (
        <GenericModal
          isOpen={open}
          onRequestClose={doClose}
          contentLabel={'Color setup'}
        >
          <SetupColorStorage doClose={doClose} {...props} />
        </GenericModal>
      )}
    </StyledDivMarginTopBottom>
  )
}

export default SetupColorModal
