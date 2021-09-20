import * as React from 'react'
import { ApplyButton } from '../styled'
import GenericModal from '../GenericModal'
import SetupColorStorage, { ISetupColorStorageProps } from './SetupColorStorage'

const SetupColorModal: React.FC<Omit<
  ISetupColorStorageProps,
  'doClose'
>> = props => {
  const [open, setOpen] = React.useState(false)
  const doOpen = React.useCallback(() => setOpen(true), [])
  const doClose = React.useCallback(() => setOpen(false), [])
  return (
    <div>
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
    </div>
  )
}

export default SetupColorModal
