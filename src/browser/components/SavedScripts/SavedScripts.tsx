import React from 'react'
import { DndProvider } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'
import { map, first, last, isEmpty } from 'lodash-es'
import { NewFolderPathGenerator, FolderUpdate } from './types'
import SavedScriptsFolder from './SavedScriptsFolder'
import { ExportButton, NewFolderButton } from './SavedScriptsButton'
import {
  SavedScriptsMain,
  SavedScriptsBody,
  SavedScriptsBodySection,
  SavedScriptsHeader,
  SavedScriptsButtonWrapper,
  SavedScriptsInput
} from './styled'
import { Favorite } from 'shared/modules/favorites/favoritesDuck'
import { Folder } from 'shared/modules/favorites/foldersDuck'
import SavedScriptsListItem from './SavedScriptsListItem'

interface SavedScriptsProps {
  title?: string
  isStatic?: boolean
  scriptsNamespace: string
  scripts: Favorite[]
  folders: Folder[]
  isProjectFiles?: boolean
  newFolderPathGenerator?: NewFolderPathGenerator
  selectScript: (script: Favorite) => void
  exportScripts: () => void
  execScript: (script: Favorite) => void
  renameScript: (script: Favorite, name: string) => void
  moveScript: (script: Favorite, folder: string) => void
  removeScript: (script: Favorite) => void
  updateFolder: (scripts: Favorite[], updates: FolderUpdate) => void
  removeFolder: (scripts: Favorite[]) => void
}

// räkna med att alla är dynamiska?
export default function SavedScripts({
  title = 'Saved Scripts',
  scripts,
  //folders,
  //updateFolder,
  //removeFolder,
  exportScripts,
  selectScript,
  execScript,
  removeScript,
  //moveScript,
  renameScript
}: SavedScriptsProps): JSX.Element {
  const scriptsOutsideFolder = scripts.filter(script => !script.folder)
  return (
    <SavedScriptsMain className="saved-scripts">
      <DndProvider backend={HTML5Backend}>
        <SavedScriptsBody className="saved-scripts__body">
          <SavedScriptsBodySection className="saved-scripts__body-section">
            <SavedScriptsHeader className="saved-scripts__header">
              {title}
              <SavedScriptsButtonWrapper className="saved-scripts__button-wrapper">
                <ExportButton onClick={() => exportScripts()} />
                <NewFolderButton
                  onClick={() => {
                    /* noop */
                  }}
                />
              </SavedScriptsButtonWrapper>
            </SavedScriptsHeader>

            {scriptsOutsideFolder.map(script => (
              <SavedScriptsListItem
                selectScript={selectScript}
                execScript={execScript}
                removeScript={removeScript}
                renameScript={renameScript}
                script={script}
                key={script.id}
              />
            ))}
            {/* alla mappar med innehåll */}
          </SavedScriptsBodySection>
        </SavedScriptsBody>
      </DndProvider>
    </SavedScriptsMain>
  )
}
