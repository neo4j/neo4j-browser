import * as React from 'react'
import GenericModal from 'browser/modules/D3Visualization/components/modal/GenericModal'
import { ApplyButton } from '../styled'
import SetupLabelStorage, {
  ISetupLabelStorageProps
} from 'project-root/src/browser/modules/D3Visualization/components/modal/label/SetupLabelStorage'

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

interface ICurrentCaptionItem {
  [key: string]: string
}

const SetupLabelModalContainer: React.FC<Omit<
  ISetupLabelStorageProps,
  'doClose'
>> = props => {
  const [open, setOpen] = React.useState(false)
  const doOpen = React.useCallback(() => setOpen(true), [])
  const doClose = React.useCallback(() => setOpen(false), [])
  return (
    <div>
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
    </div>
  )
}

export default SetupLabelModalContainer
