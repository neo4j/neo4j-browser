import React, { useState } from 'react'
import { useDrop } from 'react-dnd'
import { useCustomBlur, useNameUpdate } from './hooks'

import { EditButton, RemoveButton } from './SavedScriptsButton'
import {
  SavedScriptsCollapseMenuIcon,
  SavedScriptsExpandMenuRightIcon
} from 'browser-components/icons/Icons'

import {
  SavedScriptsButtonWrapper,
  SavedScriptsFolderCollapseIcon,
  SavedScriptsFolderHeader,
  SavedScriptsFolderLabel,
  SavedScriptsFolderMain,
  SavedScriptsInput
} from './styled'
import { Folder } from 'shared/modules/favorites/foldersDuck'

interface SavedScriptsFolderProps {
  folder: Folder
  renameFolder?: (folder: Folder, name: string) => void
  removeFolder?: (folder: Folder) => void
  moveScript?: (scriptId: string, folderId: string) => void
  children: JSX.Element[]
}

function SavedScriptsFolder({
  folder,
  moveScript,
  renameFolder,
  removeFolder,
  children
}: SavedScriptsFolderProps): JSX.Element {
  const {
    isEditing,
    currentNameValue,
    setIsEditing,
    setNameValue
  } = useNameUpdate(
    folder.name,
    name => renameFolder && renameFolder(folder, name)
  )
  const [expanded, setExpanded] = useState(false)
  const blurRef = useCustomBlur(() => setIsEditing(false))
  const drop = useDrop<
    { id: string; type: string },
    any, // Return type of "drop"
    any // return type of "collect"
  >({
    accept: 'script',
    drop: item => {
      moveScript && moveScript(item.id, folder.id)
    }
  })[1]

  return (
    <div ref={drop} data-testid={`savedScriptsFolder-${folder.name}`}>
      <SavedScriptsFolderMain className="saved-scripts-folder">
        <SavedScriptsFolderHeader
          title={folder.name}
          ref={blurRef}
          className="saved-scripts-folder__header"
        >
          {isEditing ? (
            <SavedScriptsInput
              className="saved-scripts-folder__label-input"
              type="text"
              autoFocus
              onKeyPress={({ key }) => {
                key === 'Enter' && setIsEditing(false)
              }}
              value={currentNameValue}
              onChange={e => setNameValue(e.target.value)}
              data-testid="editSavedScriptFolderName"
            />
          ) : (
            <SavedScriptsFolderLabel
              className="saved-scripts-folder__label"
              data-testid={`expandFolder-${folder.name}`}
              onClick={() => setExpanded(!expanded)}
            >
              <SavedScriptsFolderCollapseIcon className="saved-scripts-folder__collapse-icon">
                {expanded ? (
                  <SavedScriptsCollapseMenuIcon />
                ) : (
                  <SavedScriptsExpandMenuRightIcon />
                )}
              </SavedScriptsFolderCollapseIcon>
              {folder.name}
            </SavedScriptsFolderLabel>
          )}
          <SavedScriptsButtonWrapper className="saved-scripts__button-wrapper">
            {removeFolder && isEditing && (
              <RemoveButton onClick={() => removeFolder(folder)} />
            )}
            {renameFolder && !isEditing && (
              <EditButton onClick={() => setIsEditing(!isEditing)} />
            )}
          </SavedScriptsButtonWrapper>
        </SavedScriptsFolderHeader>
        {expanded && children}
      </SavedScriptsFolderMain>
    </div>
  )
}

export default SavedScriptsFolder
