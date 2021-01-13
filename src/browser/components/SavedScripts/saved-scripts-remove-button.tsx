import React, { ReactEventHandler, useState } from 'react'
import { Icon } from 'semantic-ui-react'

import { SavedScriptsButton } from './saved-scripts.styled'

export interface ISavedScriptsRemoveButtonProps {
  onRemove: ReactEventHandler
}

export default function SavedScriptsRemoveButton({
  onRemove
}: ISavedScriptsRemoveButtonProps) {
  const [isConfirming, setIsConfirming] = useState(false)

  if (isConfirming) {
    return (
      <>
        <SavedScriptsButton
          className="saved-scripts__button saved-scripts__remove-button saved-scripts__remove-button--danger"
          title="Remove"
          onClick={onRemove}
        >
          <Icon name="trash alternate outline" />
        </SavedScriptsButton>
        <SavedScriptsButton
          className="saved-scripts__button saved-scripts__cancel-remove-button"
          title="Cancel"
          onClick={() => setIsConfirming(false)}
        >
          <Icon name="delete" />
        </SavedScriptsButton>
      </>
    )
  }

  return (
    <SavedScriptsButton
      className="saved-scripts__button saved-scripts__remove-button"
      title="Remove"
      onClick={() => setIsConfirming(true)}
    >
      <Icon name="trash alternate outline" />
    </SavedScriptsButton>
  )
}
