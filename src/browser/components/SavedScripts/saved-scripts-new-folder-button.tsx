import React, { ReactEventHandler } from 'react'
import { Icon } from 'semantic-ui-react'

import { SavedScriptsNewFolderButtonButton } from './saved-scripts.styled'

export interface ISavedScriptsNewFolderButtonProps {
  disabled?: boolean
  onAdd: ReactEventHandler
}

export default function SavedScriptsNewFolderButton({
  disabled,
  onAdd
}: ISavedScriptsNewFolderButtonProps) {
  return (
    <SavedScriptsNewFolderButtonButton
      className="saved-scripts__button saved-scripts__new-folder-button"
      disabled={Boolean(disabled)}
      title="Add folder"
      onClick={onAdd}
    >
      <Icon name="folder open outline" />
    </SavedScriptsNewFolderButtonButton>
  )
}
