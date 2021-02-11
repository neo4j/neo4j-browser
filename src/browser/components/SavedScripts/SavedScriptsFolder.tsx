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
import { useDrop } from 'react-dnd'
import { useCustomBlur, useNameUpdate } from './hooks'

import { EditButton, RemoveButton } from './SavedScriptsButton'
import {
  FolderIcon,
  SavedScriptsCollapseMenuIcon,
  SavedScriptsExpandMenuRightIcon
} from 'browser-components/icons/Icons'

import {
  SavedScriptsButtonWrapper,
  SavedScriptsFolderHeader,
  SavedScriptsFolderLabel,
  SavedScriptsFolderMain,
  SavedScriptsInput,
  ChildrenContainer,
  FolderNameWrapper
} from './styled'
import { Folder } from 'shared/modules/favorites/foldersDuck'

interface SavedScriptsFolderProps {
  folder: Folder
  renameFolder?: (folder: Folder, name: string) => void
  removeFolder?: (folder: Folder) => void
  moveScript?: (scriptId: string, folderId: string) => void
  selectedScriptIds: string[]
  children: JSX.Element[]
}

function SavedScriptsFolder({
  folder,
  moveScript,
  renameFolder,
  removeFolder,
  selectedScriptIds,
  children
}: SavedScriptsFolderProps): JSX.Element {
  const {
    isEditing,
    currentNameValue,
    beginEditing,
    doneEditing,
    setNameValue
  } = useNameUpdate(
    folder.name,
    () => renameFolder && renameFolder(folder, currentNameValue)
  )
  const blurRef = useCustomBlur(doneEditing)
  const [expanded, setExpanded] = useState(false)
  const drop = useDrop<
    { id: string; type: string },
    any, // Return type of "drop"
    any // return type of "collect"
  >({
    accept: 'script',
    drop: item => {
      if (moveScript) {
        // move dragged
        moveScript(item.id, folder.id)
        // Also move all selected
        selectedScriptIds.forEach(id => moveScript(id, folder.id))
      }
    }
  })[1]

  return (
    <div ref={drop} data-testid={`savedScriptsFolder-${folder.name}`}>
      <SavedScriptsFolderMain>
        <SavedScriptsFolderHeader title={folder.name} ref={blurRef}>
          {isEditing ? (
            <SavedScriptsInput
              type="text"
              autoFocus
              onKeyPress={({ key }) => {
                key === 'Enter' && doneEditing()
              }}
              value={currentNameValue}
              onChange={e => setNameValue(e.target.value)}
              data-testid="editSavedScriptFolderName"
            />
          ) : (
            <SavedScriptsFolderLabel
              data-testid={`expandFolder-${folder.name}`}
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? (
                <SavedScriptsCollapseMenuIcon />
              ) : (
                <SavedScriptsExpandMenuRightIcon />
              )}
              <FolderIcon />
              <FolderNameWrapper> {folder.name} </FolderNameWrapper>
            </SavedScriptsFolderLabel>
          )}
          <SavedScriptsButtonWrapper>
            {removeFolder && isEditing && (
              <RemoveButton onClick={() => removeFolder(folder)} />
            )}
            {renameFolder && !isEditing && (
              <EditButton onClick={beginEditing} />
            )}
          </SavedScriptsButtonWrapper>
        </SavedScriptsFolderHeader>
        <ChildrenContainer> {expanded && children}</ChildrenContainer>
      </SavedScriptsFolderMain>
    </div>
  )
}

export default SavedScriptsFolder
