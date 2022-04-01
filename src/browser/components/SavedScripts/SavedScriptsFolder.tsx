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

import {
  FolderIcon,
  NavIcon,
  SavedScriptsCollapseMenuIcon,
  SavedScriptsExpandMenuRightIcon
} from '../icons/LegacyIcons'

import { useCustomBlur, useNameUpdate } from './hooks'
import {
  ChildrenContainer,
  ContextMenu,
  ContextMenuContainer,
  ContextMenuHoverParent,
  ContextMenuItem,
  FolderNameWrapper,
  SavedScriptsButtonWrapper,
  SavedScriptsFolderHeader,
  SavedScriptsFolderLabel,
  SavedScriptsFolderMain,
  SavedScriptsFolderMenuIconWrapper,
  SavedScriptsInput
} from './styled'
import { ExportFormat } from 'services/exporting/favoriteUtils'
import { Folder } from 'shared/modules/favorites/foldersDuck'

interface SavedScriptsFolderProps {
  folder: Folder
  renameFolder?: (folderId: string, name: string) => void
  removeFolder?: (folderId: string) => void
  exportScripts?: (format: ExportFormat) => void
  moveScript?: (scriptId: string, folderId: string) => void
  forceEdit: boolean
  onDoneEditing: () => void
  selectedScriptIds: string[]
  children: React.ReactNode
}

function SavedScriptsFolder({
  folder,
  moveScript,
  renameFolder,
  removeFolder,
  exportScripts,
  selectedScriptIds,
  forceEdit,
  onDoneEditing,
  children
}: SavedScriptsFolderProps): JSX.Element {
  const {
    isEditing,
    currentNameValue,
    beginEditing,
    doneEditing,
    setNameValue
  } = useNameUpdate(folder.name, () => {
    renameFolder && renameFolder(folder.id, currentNameValue)
    onDoneEditing()
  })
  const blurRef = useCustomBlur(() => {
    doneEditing()
    onDoneEditing()
  })
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

  const [showOverlay, setShowOverlay] = useState(false)
  const overlayBlurRef = useCustomBlur(() => setShowOverlay(false))
  const toggleOverlay = () => setShowOverlay(t => !t)
  const contextMenuContent = [
    renameFolder && (
      <ContextMenuItem
        data-testid="contextMenuRename"
        onClick={beginEditing}
        key="rename"
      >
        Rename folder
      </ContextMenuItem>
    ),
    removeFolder && (
      <ContextMenuItem
        data-testid="contextMenuRemove"
        onClick={() => removeFolder(folder.id)}
        key="remove"
      >
        Delete folder
      </ContextMenuItem>
    ),
    exportScripts && (
      <ContextMenuItem
        data-testid="contextMenuExportZip"
        onClick={() => exportScripts('ZIPFILE')}
        key="exportZip"
      >
        Export scripts as .zip file
      </ContextMenuItem>
    ),
    exportScripts && (
      <ContextMenuItem
        data-testid="contextMenuExportCypherFile"
        onClick={() => exportScripts('CYPHERFILE')}
        key="exportAsCypher"
      >
        Export scripts as .cypher file
      </ContextMenuItem>
    )
  ].filter(defined => defined)

  return (
    <ContextMenuHoverParent
      ref={drop}
      data-testid={`savedScriptsFolder-${folder.name}`}
      stayVisible={showOverlay}
    >
      <SavedScriptsFolderMain>
        <SavedScriptsFolderHeader title={folder.name} ref={blurRef}>
          {isEditing || forceEdit ? (
            <SavedScriptsInput
              type="text"
              autoFocus
              onKeyPress={({ key }) => {
                if (key === 'Enter') {
                  doneEditing()
                  onDoneEditing()
                }
              }}
              onFocus={event => event.target.select()}
              value={currentNameValue}
              onChange={e => setNameValue(e.target.value)}
              data-testid="editSavedScriptFolderName"
            />
          ) : (
            <SavedScriptsFolderLabel
              data-testid={`expandFolder-${folder.name}`}
              onClick={() => setExpanded(!expanded)}
            >
              <SavedScriptsFolderMenuIconWrapper>
                {expanded ? (
                  <SavedScriptsCollapseMenuIcon />
                ) : (
                  <SavedScriptsExpandMenuRightIcon />
                )}
              </SavedScriptsFolderMenuIconWrapper>
              <FolderIcon />
              <FolderNameWrapper> {folder.name} </FolderNameWrapper>
            </SavedScriptsFolderLabel>
          )}
          <SavedScriptsButtonWrapper>
            {contextMenuContent.length > 0 && (
              <ContextMenuContainer
                onClick={toggleOverlay}
                data-testid={`navicon-${folder.name}`}
              >
                <NavIcon />
                {showOverlay && (
                  <ContextMenu ref={overlayBlurRef}>
                    {contextMenuContent}
                  </ContextMenu>
                )}
              </ContextMenuContainer>
            )}
          </SavedScriptsButtonWrapper>
        </SavedScriptsFolderHeader>
        <ChildrenContainer> {expanded && children}</ChildrenContainer>
      </SavedScriptsFolderMain>
    </ContextMenuHoverParent>
  )
}

export default SavedScriptsFolder
