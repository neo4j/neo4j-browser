import React, { ReactEventHandler } from 'react'
import { Icon } from 'semantic-ui-react'

import { SavedScriptsButton } from './saved-scripts.styled'

export interface ISavedScriptsExecButtonProps {
  onExec: ReactEventHandler
}

export default function SavedScriptsExecButton({
  onExec
}: ISavedScriptsExecButtonProps) {
  return (
    <SavedScriptsButton
      className="saved-scripts__button saved-scripts__exec-button"
      onClick={onExec}
      data-testid="execScript"
    >
      <Icon name="play" />
    </SavedScriptsButton>
  )
}
