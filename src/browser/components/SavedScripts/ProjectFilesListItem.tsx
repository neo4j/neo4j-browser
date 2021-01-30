import React from 'react'
import { RunButton } from './SavedScriptsButton'
import {
  SavedScriptsButtonWrapper,
  SavedScriptsListItemDisplayName,
  SavedScriptsListItemMain
} from './styled'
import { ProjectFileScript } from './ProjectFilesList'

interface ProjectFilesListItemProps {
  script: ProjectFileScript
  selectScript: (script: ProjectFileScript) => void
  execScript: (cmd: string) => void
}

function ProjectFilesListItem({
  script,
  selectScript,
  execScript
}: ProjectFilesListItemProps): JSX.Element {
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
        <RunButton onClick={() => script.content.then(execScript)} />
      </SavedScriptsButtonWrapper>
    </SavedScriptsListItemMain>
  )
}

export default ProjectFilesListItem
