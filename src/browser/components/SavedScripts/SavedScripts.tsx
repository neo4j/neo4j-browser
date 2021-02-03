import React, { useState } from 'react'
import { DndProvider } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'
import SavedScriptsFolder from './SavedScriptsFolder'
import { ExportButton, NewFolderButton } from './SavedScriptsButton'
import {
  SavedScriptsMain,
  SavedScriptsBody,
  SavedScriptsBodySection,
  SavedScriptsHeader,
  SavedScriptsButtonWrapper,
  SavedScriptsListItemDisplayName
} from './styled'
import { Folder } from 'shared/modules/favorites/foldersDuck'
import SavedScriptsListItem from './SavedScriptsListItem'
import { getScriptDisplayName } from './utils'
import { uniq } from 'lodash-es'
import { Favorite } from 'shared/modules/favorites/favoritesDuck'
import { useCustomBlur } from './hooks'

interface SavedScriptsProps {
  title?: string
  scripts: Favorite[]
  folders: Folder[]
  selectScript: (script: Favorite) => void
  execScript: (script: Favorite) => void
  // When optional callbacks aren't provided, respective UI elements are hidden
  exportScripts?: (scripts: Favorite[], folders: Folder[]) => void
  renameScript?: (script: Favorite, name: string) => void
  moveScript?: (scriptId: string, folderId: string) => void
  removeScript?: (script: Favorite) => void
  renameFolder?: (folder: Folder, name: string) => void
  removeFolder?: (folder: Folder) => void
  createNewFolder?: () => void
  createNewScript?: () => void
}

export default function SavedScripts({
  title = 'Saved Scripts',
  scripts,
  folders,
  selectScript,
  createNewScript,
  execScript,
  renameScript,
  removeScript,
  moveScript,
  renameFolder,
  removeFolder,
  exportScripts,
  createNewFolder
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

  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const blurRef = useCustomBlur(() => setSelectedIds([]))
  const onListItemClick = (clickedScriptId: string) => (
    e: React.MouseEvent
  ) => {
    const toggleFn = (ids: string[]) =>
      ids.includes(clickedScriptId)
        ? ids.filter(existingId => existingId !== clickedScriptId)
        : ids.concat(clickedScriptId)

    const getIdRange = (id1: string, id2: string): string[] => {
      const scriptIds: string[] = scripts
        .concat([]) // to avoid mutating in place by sort
        .sort(sortScriptsAlfabethically)
        .map(getUniqueScriptKey)
      const pos1 = scriptIds.indexOf(id1)
      const pos2 = scriptIds.indexOf(id2)
      if (pos1 === -1 || pos2 == -1) {
        throw new Error("Can't get range between ids not in list")
      }

      const smallestFirst = pos1 < pos2 ? [pos1, pos2] : [pos2, pos1]
      return scriptIds.slice(
        smallestFirst[0],
        smallestFirst[1] + 1 /* inclusive slice */
      )
    }

    const allowMultiselect = e.metaKey || e.ctrlKey
    const bulkSelect = e.shiftKey
    if (allowMultiselect) {
      if (bulkSelect) {
        setSelectedIds(ids =>
          ids.length === 0
            ? [clickedScriptId]
            : uniq([
                ...ids,
                ...getIdRange(ids[ids.length - 1], clickedScriptId)
              ])
        )
      } else {
        setSelectedIds(toggleFn)
      }
    } else {
      setSelectedIds([clickedScriptId])
    }
  }

  return (
    <SavedScriptsMain className="saved-scripts">
      <DndProvider backend={HTML5Backend}>
        <SavedScriptsBody className="saved-scripts__body">
          <SavedScriptsBodySection
            ref={blurRef}
            className="saved-scripts__body-section"
          >
            <SavedScriptsHeader className="saved-scripts__header">
              {title}
              <SavedScriptsButtonWrapper className="saved-scripts__button-wrapper">
                {exportScripts && (
                  <ExportButton
                    onClick={() => exportScripts(scripts, folders)}
                  />
                )}
                {createNewFolder && (
                  <NewFolderButton onClick={createNewFolder} />
                )}
              </SavedScriptsButtonWrapper>
            </SavedScriptsHeader>

            {scriptsOutsideFolder.map(script => {
              const key = getUniqueScriptKey(script)
              return (
                <SavedScriptsListItem
                  selectScript={selectScript}
                  execScript={execScript}
                  removeScript={removeScript}
                  renameScript={renameScript}
                  script={script}
                  key={key}
                  onClick={onListItemClick(key)}
                  isSelected={selectedIds.includes(key)}
                />
              )
            })}
            {createNewScript && (
              <SavedScriptsListItemDisplayName
                className="saved-scripts-list-item__display-name"
                onClick={createNewScript}
              >
                Create new favorite
              </SavedScriptsListItemDisplayName>
            )}
            {foldersWithScripts.map(({ folder, scripts }) => (
              <SavedScriptsFolder
                folder={folder}
                renameFolder={renameFolder}
                removeFolder={removeFolder}
                moveScript={moveScript}
                key={folder.id}
              >
                {scripts.map(script => {
                  const key = getUniqueScriptKey(script)
                  return (
                    <SavedScriptsListItem
                      selectScript={selectScript}
                      execScript={execScript}
                      removeScript={removeScript}
                      renameScript={renameScript}
                      script={script}
                      key={key}
                      onClick={onListItemClick(key)}
                      isSelected={selectedIds.includes(key)}
                    />
                  )
                })}
              </SavedScriptsFolder>
            ))}
          </SavedScriptsBodySection>
        </SavedScriptsBody>
      </DndProvider>
    </SavedScriptsMain>
  )
}

function getUniqueScriptKey(script: Favorite) {
  // static scripts don't have ids but their names are unique
  return script.id || getScriptDisplayName(script)
}

function sortScriptsAlfabethically(a: Favorite, b: Favorite) {
  const name1 = getScriptDisplayName(a).toLowerCase()
  const name2 = getScriptDisplayName(b).toLowerCase()
  return name1.localeCompare(name2)
}
