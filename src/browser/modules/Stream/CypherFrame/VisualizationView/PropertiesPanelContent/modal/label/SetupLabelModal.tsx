import * as React from 'react'

import { ApplyButton, StyledDivMarginTopBottom } from '../styled'
import SetupLabelStorage, { ISetupLabelStorageProps } from './SetupLabelStorage'
import GenericModal from '../GenericModal'

export enum LabelPosition {
  top,
  middle,
  bottom
}

export const allLabelPositions: LabelPosition[] = [
  LabelPosition.top,
  LabelPosition.middle,
  LabelPosition.bottom
]

export interface ICaptionSettings {
  [LabelPosition.top]: ICurrentCaptionItem
  [LabelPosition.middle]: ICurrentCaptionItem
  [LabelPosition.bottom]: ICurrentCaptionItem
}

export interface ICurrentCaptionItem {
  [key: string]: string
}

const SetupLabelModalContainer: React.FC<
  Omit<ISetupLabelStorageProps, 'doClose'>
> = props => {
  const [open, setOpen] = React.useState(false)
  const doOpen = React.useCallback(() => setOpen(true), [])
  const doClose = React.useCallback(() => setOpen(false), [])
  return (
    <StyledDivMarginTopBottom>
      <ApplyButton onClick={doOpen}>Setup Label</ApplyButton>
      {open && (
        <GenericModal
          isOpen={open}
          onRequestClose={doClose}
          contentLabel={'Label setup'}
        >
          <SetupLabelStorage doClose={doClose} {...props} />
        </GenericModal>
      )}
    </StyledDivMarginTopBottom>
  )
}

export default SetupLabelModalContainer
