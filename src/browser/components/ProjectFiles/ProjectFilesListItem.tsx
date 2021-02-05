import React, { useState } from 'react'
import {
  RemoveButton,
  RedRemoveButton,
  RunButton
} from '../SavedScripts/SavedScriptsButton'
import {
  SavedScriptsButtonWrapper,
  SavedScriptsListItemDisplayName,
  SavedScriptsListItemMain
} from '../SavedScripts/styled'
import { ProjectFileScript } from './ProjectFilesList'

interface ProjectFilesListItemProps {
  script: ProjectFileScript
  selectScript: (script: ProjectFileScript) => void
  removeScript: (script: ProjectFileScript) => void
  execScript: (cmd: string) => void
}

function ProjectFilesListItem({
  script,
  selectScript,
  execScript,
  removeScript
}: ProjectFilesListItemProps): JSX.Element {
  const [isEditing, setIsEditing] = useState(false)
  return (
    <SavedScriptsListItemMain className="saved-scripts-list-item">
      <SavedScriptsListItemDisplayName
        className="saved-scripts-list-item__display-name"
        data-testid={`scriptTitle-${script.filename}`}
        onClick={() => selectScript(script)}
      >
        {script.filename}
      </SavedScriptsListItemDisplayName>
      <SavedScriptsButtonWrapper className="saved-scripts__button-wrapper">
        {isEditing ? (
          <RedRemoveButton onClick={() => removeScript(script)} />
        ) : (
          <RemoveButton onClick={() => setIsEditing(true)} />
        )}
        <RunButton onClick={() => script.content.then(execScript)} />
      </SavedScriptsButtonWrapper>
    </SavedScriptsListItemMain>
  )
}

export default ProjectFilesListItem