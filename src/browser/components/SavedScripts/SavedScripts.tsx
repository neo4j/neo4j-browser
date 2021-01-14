import React from 'react'
import { DndProvider } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'
import {
  map,
  first,
  last,
  sortBy,
  lowerCase,
  compact,
  isEmpty
} from 'lodash-es'
import { Script, NewFolderPathGenerator, FolderUpdate } from './types'
import { useEmptyFolders, useScriptsFolders } from './hooks'
import SavedScriptsFolder from './SavedScriptsFolder'
import { ExportButton, NewFolderButton } from './SavedScriptsButton'
import {
  SavedScriptsMain,
  SavedScriptsBody,
  SavedScriptsBodySection,
  SavedScriptsHeader,
  SavedScriptsButtonWrapper
} from './styled'
import { getEmptyFolderDefaultPath } from './utils'

interface SavedScriptsProps {
  title?: string
  isStatic?: boolean
  scriptsNamespace: string
  scripts: Script[]
  isProjectFiles?: boolean
  newFolderPathGenerator?: NewFolderPathGenerator
  selectScript: (script: Script) => void
  exportScripts: () => void
  execScript: (script: Script) => void
  removeScript: (script: Script) => void
  updateFolder: (scripts: Script[], updates: FolderUpdate) => void
  removeFolder: (scripts: Script[]) => void
}

export default function SavedScripts({
  title = 'Saved Scripts',
  isStatic,
  scriptsNamespace,
  scripts,
  isProjectFiles,
  newFolderPathGenerator,
  selectScript,
  exportScripts,
  execScript,
  removeScript,
  updateFolder,
  removeFolder
}: SavedScriptsProps): JSX.Element {
  const [rootFolder, subFolders] = useScriptsFolders(scriptsNamespace, scripts)
  // lodash-es typings cant handle tuples
  const allSavedFolderNames = compact([
    first(rootFolder),
    ...map(subFolders, first)
  ]) as string[]
  const [
    emptyFolders,
    canAddFolder,
    addEmptyFolder,
    updateEmptyFolder,
    removeEmptyFolder
  ] = useEmptyFolders(
    scriptsNamespace,
    newFolderPathGenerator || getEmptyFolderDefaultPath,
    allSavedFolderNames
  )
  const allFolderNames = [...allSavedFolderNames, ...emptyFolders]
  const sortedSubFolders = sortBy(subFolders, folder =>
    // lodash-es typings cant handle tuples
    lowerCase(first(folder) as string | undefined)
  )

  return (
    <SavedScriptsMain className="saved-scripts">
      <DndProvider backend={HTML5Backend}>
        <SavedScriptsBody className="saved-scripts__body">
          <SavedScriptsBodySection className="saved-scripts__body-section">
            <SavedScriptsHeader className="saved-scripts__header">
              {title}
              <SavedScriptsButtonWrapper className="saved-scripts__button-wrapper">
                {isStatic || isProjectFiles ? null : (
                  <>
                    <ExportButton onClick={() => exportScripts()} />
                    <NewFolderButton onClick={() => addEmptyFolder()} />
                  </>
                )}
              </SavedScriptsButtonWrapper>
            </SavedScriptsHeader>
            <SavedScriptsFolder
              isRoot
              isStatic={isStatic}
              scriptsNamespace={scriptsNamespace}
              allFolderNames={allFolderNames}
              folderName={first(rootFolder) as string}
              scripts={last(rootFolder) as Script[]}
              isProjectFiles={isProjectFiles}
              selectScript={selectScript}
              execScript={execScript}
              removeScript={removeScript}
              updateFolder={updateFolder}
            />
            {map(sortedSubFolders, ([folderName, subScripts]) => (
              <SavedScriptsFolder
                key={`my-folder-${folderName}`}
                isStatic={isStatic}
                scriptsNamespace={scriptsNamespace}
                allFolderNames={allFolderNames}
                folderName={folderName}
                scripts={subScripts}
                isProjectFiles={isProjectFiles}
                selectScript={selectScript}
                execScript={execScript}
                removeScript={removeScript}
                updateFolder={updateFolder}
                removeFolder={removeFolder}
              />
            ))}
            {map(emptyFolders, folderName => (
              <SavedScriptsFolder
                key={`my-empty-folder-${folderName}`}
                isStatic={isStatic}
                scriptsNamespace={scriptsNamespace}
                allFolderNames={allFolderNames}
                folderName={folderName}
                scripts={[]}
                isProjectFiles={isProjectFiles}
                updateFolder={(folderScripts: Script[], { path }: any) =>
                  !isEmpty(folderScripts)
                    ? updateFolder(folderScripts, { isNewFolder: true, path })
                    : updateEmptyFolder(folderName, path)
                }
                removeFolder={() => removeEmptyFolder(folderName)}
              />
            ))}
          </SavedScriptsBodySection>
        </SavedScriptsBody>
      </DndProvider>
    </SavedScriptsMain>
  )
}
