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

import { AnyFunc, IScript, NewFolderPathGenerator } from './types'

import { useEmptyFolders, useScriptsFolders } from './saved-scripts.hooks'

import SavedScriptsFolder from './saved-scripts-folder'
import { ExportButton, NewFolderButton } from './SavedScriptsButton'

import {
  SavedScriptsMain,
  SavedScriptsBody,
  SavedScriptsBodySection,
  SavedScriptsHeader,
  SavedScriptsButtonWrapper
} from './saved-scripts.styled'
import { getEmptyFolderDefaultPath } from './saved-scripts.utils'

export interface ISavedScriptsProps {
  title?: string
  isStatic?: boolean
  scriptsNamespace: string
  scripts: IScript[]
  isProjectFiles?: boolean
  newFolderPathGenerator?: NewFolderPathGenerator
  onSelectScript: AnyFunc
  onExportScripts: AnyFunc
  onExecScript: AnyFunc
  onRemoveScript: AnyFunc
  onUpdateFolder: AnyFunc
  onRemoveFolder: AnyFunc
}

export default function SavedScripts({
  title = 'Saved Scripts',
  isStatic,
  scriptsNamespace,
  scripts,
  isProjectFiles,
  newFolderPathGenerator,
  onSelectScript,
  onExportScripts,
  onExecScript,
  onRemoveScript,
  onUpdateFolder,
  onRemoveFolder
}: ISavedScriptsProps) {
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
                    <ExportButton onClick={() => onExportScripts()} />
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
              scripts={last(rootFolder) as IScript[]}
              isProjectFiles={isProjectFiles}
              onSelectScript={onSelectScript}
              onExecScript={onExecScript}
              onRemoveScript={onRemoveScript}
              onUpdateFolder={onUpdateFolder}
              onRemoveFolder={Function.prototype}
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
                onSelectScript={onSelectScript}
                onExecScript={onExecScript}
                onRemoveScript={onRemoveScript}
                onUpdateFolder={onUpdateFolder}
                onRemoveFolder={onRemoveFolder}
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
                onSelectScript={Function.prototype}
                onExecScript={Function.prototype}
                onRemoveScript={Function.prototype}
                onUpdateFolder={(folderScripts: IScript[], { path }: any) =>
                  !isEmpty(folderScripts)
                    ? onUpdateFolder(folderScripts, { isNewFolder: true, path })
                    : updateEmptyFolder(folderName, path)
                }
                onRemoveFolder={() => removeEmptyFolder(folderName)}
              />
            ))}
          </SavedScriptsBodySection>
        </SavedScriptsBody>
      </DndProvider>
    </SavedScriptsMain>
  )
}
