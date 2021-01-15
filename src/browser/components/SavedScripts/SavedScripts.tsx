import React from 'react'
import { DndProvider } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'
import SavedScriptsFolder from './SavedScriptsFolder'
import { ExportButton, NewFolderButton } from './SavedScriptsButton'
import {
  SavedScriptsMain,
  SavedScriptsBody,
  SavedScriptsBodySection,
  SavedScriptsHeader,
  SavedScriptsButtonWrapper
} from './styled'
import { Favorite } from 'shared/modules/favorites/favoritesDuck'
import { Folder } from 'shared/modules/favorites/foldersDuck'
import SavedScriptsListItem from './SavedScriptsListItem'
import { getScriptDisplayName } from './utils'

interface SavedScriptsProps {
  title?: string
  isStatic?: boolean
  scriptsNamespace: string
  scripts: Favorite[]
  folders: Folder[]
  isProjectFiles?: boolean
  selectScript: (script: Favorite) => void
  execScript: (script: Favorite) => void
  // When optional callbacks aren't provided, respective UI elements are hidden
  exportScripts?: () => void
  renameScript?: (script: Favorite, name: string) => void
  moveScript?: (script: Favorite, folder: string) => void
  removeScript?: (script: Favorite) => void
  renameFolder?: (folder: Folder, name: string) => void
  removeFolder?: (folder: Folder) => void
  createNewFolder?: () => void
}

export default function SavedScripts({
  title = 'Saved Scripts',
  scripts,
  folders,
  createNewFolder,
  renameFolder,
  removeFolder,
  exportScripts,
  selectScript,
  execScript,
  removeScript,
  renameScript
}: SavedScriptsProps): JSX.Element {
  const scriptsOutsideFolder = scripts
    .filter(script => !script.folder)
    .sort(sortScriptsAlfabethically)
  const foldersWithScripts = folders.map(folder => ({
    folder,
    scripts: scripts
      .filter(script => script.folder === folder.id)
      .sort(sortScriptsAlfabethically)
  }))
  return (
    <SavedScriptsMain className="saved-scripts">
      <DndProvider backend={HTML5Backend}>
        <SavedScriptsBody className="saved-scripts__body">
          <SavedScriptsBodySection className="saved-scripts__body-section">
            <SavedScriptsHeader className="saved-scripts__header">
              {title}
              <SavedScriptsButtonWrapper className="saved-scripts__button-wrapper">
                {exportScripts && <ExportButton onClick={exportScripts} />}
                {createNewFolder && (
                  <NewFolderButton onClick={createNewFolder} />
                )}
              </SavedScriptsButtonWrapper>
            </SavedScriptsHeader>

            {scriptsOutsideFolder.map(script => (
              <SavedScriptsListItem
                selectScript={selectScript}
                execScript={execScript}
                removeScript={removeScript}
                renameScript={renameScript}
                script={script}
                key={getUniqueScriptKey(script)}
              />
            ))}
            {foldersWithScripts.map(({ folder, scripts }) => (
              <SavedScriptsFolder
                folder={folder}
                renameFolder={renameFolder}
                removeFolder={removeFolder}
                key={folder.id}
              >
                {scripts.map(script => (
                  <SavedScriptsListItem
                    selectScript={selectScript}
                    execScript={execScript}
                    removeScript={removeScript}
                    renameScript={renameScript}
                    script={script}
                    key={getUniqueScriptKey(script)}
                  />
                ))}
              </SavedScriptsFolder>
            ))}
          </SavedScriptsBodySection>
        </SavedScriptsBody>
      </DndProvider>
    </SavedScriptsMain>
  )
}

function getUniqueScriptKey(script: Favorite) {
  /* static scripts don't have ids but their names are unique*/
  return script.id || getScriptDisplayName(script)
}

function sortScriptsAlfabethically(a: Favorite, b: Favorite) {
  const name1 = getScriptDisplayName(a).toLowerCase()
  const name2 = getScriptDisplayName(b).toLowerCase()
  return name1.localeCompare(name2)
}
