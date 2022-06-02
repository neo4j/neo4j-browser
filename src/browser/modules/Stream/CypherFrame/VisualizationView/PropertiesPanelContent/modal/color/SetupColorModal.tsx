import * as React from 'react'

import GenericModal from '../GenericModal'
import { ApplyButton, StyledDivMarginTopBottom } from '../styled'
import SetupColorStorage, { ISetupColorStorageProps } from './SetupColorStorage'

const SetupColorModal: React.FC<
  Omit<ISetupColorStorageProps, 'doClose'>
> = props => {
  const [open, setOpen] = React.useState(false)
  const doOpen = React.useCallback(() => setOpen(true), [])
  const doClose = React.useCallback(() => setOpen(false), [])
  return (
    <StyledDivMarginTopBottom>
      <ApplyButton onClick={doOpen} backgroundColor={'#f76060'}>
        Setup Color Rules
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
