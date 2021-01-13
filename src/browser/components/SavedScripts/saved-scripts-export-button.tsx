import React, { ReactEventHandler } from 'react'
import { Icon } from 'semantic-ui-react'

import { SavedScriptsButton } from './saved-scripts.styled'

export interface ISavedScriptsExportButtonProps {
  onExport: ReactEventHandler
}

export default function SavedScriptsExportButton({
  onExport
}: ISavedScriptsExportButtonProps) {
  return (
    <SavedScriptsButton
      className="saved-scripts__button saved-scripts__export-button"
      onClick={onExport}
    >
      <Icon name="download" />
    </SavedScriptsButton>
  )
}
