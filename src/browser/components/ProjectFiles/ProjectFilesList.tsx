import React from 'react'
import {
  SavedScriptsMain,
  SavedScriptsBody,
  SavedScriptsBodySection,
  SavedScriptsHeader
} from '../SavedScripts/styled'
import ProjectFilesListItem from './ProjectFilesListItem'

export type ProjectFileScript = {
  id: string
  content: Promise<string>
  filename: string
}

interface ProjectFileListProps {
  title?: string
  scripts: ProjectFileScript[]
  selectScript: (script: ProjectFileScript) => void
  execScript: (cmd: string) => void
}

export default function ProjectFileList({
  title = 'Cypher files',
  scripts,
  selectScript,
  execScript
}: ProjectFileListProps): JSX.Element {
  const sortedScripts = scripts.sort((f1, f2) =>
    f1.filename.localeCompare(f2.filename)
  )

  return (
    <SavedScriptsMain className="saved-scripts">
      <SavedScriptsBody className="saved-scripts__body">
        <SavedScriptsBodySection className="saved-scripts__body-section">
          <SavedScriptsHeader className="saved-scripts__header">
            {title}
          </SavedScriptsHeader>

          {sortedScripts.map(script => (
            <ProjectFilesListItem
              selectScript={selectScript}
              execScript={execScript}
              script={script}
              key={script.id}
            />
          ))}
        </SavedScriptsBodySection>
      </SavedScriptsBody>
    </SavedScriptsMain>
  )
}
