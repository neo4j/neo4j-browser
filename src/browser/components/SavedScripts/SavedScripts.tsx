/*
 * Copyright (c) "Neo4j"
 * Neo4j Sweden AB [http://neo4j.com]
 *
 * This file is part of Neo4j.
 *
 * Neo4j is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import React, { useState } from 'react'
import { DndProvider } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'
import SavedScriptsFolder from './SavedScriptsFolder'
import {
  ExportButton,
  NewFolderButton,
  RedRemoveButton
} from './SavedScriptsButton'
import {
  SavedScriptsBody,
  SavedScriptsHeader,
  SavedScriptsButtonWrapper,
  SavedScriptsNewFavorite
} from './styled'
import { Folder } from 'shared/modules/favorites/foldersDuck'
import SavedScriptsListItem from './SavedScriptsListItem'
import { getScriptDisplayName } from './utils'
import { uniq } from 'lodash-es'
import { Favorite } from 'shared/modules/favorites/favoritesDuck'
import { useCustomBlur } from './hooks'
import { AddIcon } from 'browser-components/icons/Icons'
import uuid from 'uuid'

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
  addScript?: (content: string) => void
  removeScripts?: (scripts: string[]) => void
  renameFolder?: (folderId: string, name: string) => void
  removeFolder?: (folderId: string) => void
  createNewFolder?: (id?: string) => void
  createNewScript?: () => void
}

function findScriptsFromIds(ids: string[], scripts: Favorite[]): Favorite[] {
  function notEmpty<T>(value?: T): value is T {
    return value !== undefined
  }

  return ids
    .map(id => scripts.find(script => getUniqueScriptKey(script) === id))
    .filter(notEmpty)
}

export default function SavedScripts({
  title = 'Saved Scripts',
  scripts,
  folders,
  selectScript,
  createNewScript,
  execScript,
  renameScript,
  removeScripts,
  addScript,
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

  const [unNamedFolder, setUnNamedFolder] = useState<string | null>(null)
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

    const manualMultiselect = e.metaKey || e.ctrlKey
    const bulkSelect = e.shiftKey
    if (bulkSelect) {
      setSelectedIds(ids =>
        ids.length === 0
          ? [clickedScriptId]
          : uniq([...ids, ...getIdRange(ids[ids.length - 1], clickedScriptId)])
      )
    } else if (manualMultiselect) {
      setSelectedIds(toggleFn)
    } else {
      setSelectedIds([clickedScriptId])
    }
  }

  const selectedScripts = findScriptsFromIds(selectedIds, scripts)
  const removeScript =
    removeScripts && ((id: string) => () => removeScripts([id]))
  const hasSelectedIds = !!selectedScripts.length
  const newFolderButton = createNewFolder && (
    <NewFolderButton
      onClick={() => {
        const id = uuid.v4()
        setUnNamedFolder(id)
        createNewFolder(id)
      }}
    />
  )
  return (
    <DndProvider backend={HTML5Backend}>
      <SavedScriptsBody ref={blurRef}>
        <SavedScriptsHeader>
          <span>{title}</span>
          {hasSelectedIds ? (
            <>
              <span>|</span>
              <SavedScriptsButtonWrapper>
                <span style={{ fontSize: 12 }}>
                  {selectedIds.length} selected
                  {exportScripts && (
                    <ExportButton
                      onClick={() => {
                        exportScripts(selectedScripts, folders)
                        setSelectedIds([])
                      }}
                    />
                  )}
                  {removeScripts && (
                    <RedRemoveButton
                      onClick={() => {
                        removeScripts(selectedIds)
                        setSelectedIds([])
                      }}
                    />
                  )}
                </span>
                {newFolderButton}
              </SavedScriptsButtonWrapper>
            </>
          ) : (
            newFolderButton
          )}
        </SavedScriptsHeader>

        {scriptsOutsideFolder.map(script => {
          const key = getUniqueScriptKey(script)
          return (
            <SavedScriptsListItem
              selectScript={() => selectScript(script)}
              execScript={() => execScript(script)}
              duplicateScript={() => addScript && addScript(script.content)}
              removeScript={removeScript && removeScript(key)}
              renameScript={(name: string) =>
                renameScript && renameScript(script, name)
              }
              script={script}
              key={key}
              onClick={onListItemClick(key)}
              isSelected={selectedIds.includes(key)}
            />
          )
        })}
        {foldersWithScripts.map(({ folder, scripts }) => (
          <SavedScriptsFolder
            folder={folder}
            renameFolder={renameFolder}
            removeFolder={removeFolder}
            moveScript={moveScript}
            key={folder.id}
            selectedScriptIds={selectedIds}
            forceEdit={folder.id === unNamedFolder}
            onDoneEditing={() => setUnNamedFolder(null)}
          >
            {scripts.map(script => {
              const key = getUniqueScriptKey(script)
              return (
                <SavedScriptsListItem
                  selectScript={() => selectScript(script)}
                  execScript={() => execScript(script)}
                  duplicateScript={
                    addScript && (() => addScript(script.content))
                  }
                  removeScript={removeScript && removeScript(key)}
                  renameScript={
                    renameScript &&
                    ((name: string) => renameScript(script, name))
                  }
                  script={script}
                  key={key}
                  onClick={onListItemClick(key)}
                  isSelected={selectedIds.includes(key)}
                />
              )
            })}
          </SavedScriptsFolder>
        ))}
        {createNewScript && (
          <SavedScriptsNewFavorite
            data-testid="createNewFavorite"
            onClick={createNewScript}
          >
            <AddIcon /> Add empty favorite
          </SavedScriptsNewFavorite>
        )}
      </SavedScriptsBody>
    </DndProvider>
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
