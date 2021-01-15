import React, { useState } from 'react'
import { DropTarget, DragElementWrapper } from 'react-dnd'
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
  children: JSX.Element[]
}
type DropProp = {
  connectDropTarget: DragElementWrapper<any>
}

function SavedScriptsFolder({
  folder,
  renameFolder,
  removeFolder,
  connectDropTarget,
  children
}: SavedScriptsFolderProps & DropProp) {
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

  return connectDropTarget(
    <div data-testid={`savedScriptsFolder-${folder.name}`}>
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

export default DropTarget<SavedScriptsFolderProps, DropProp>(
  props => props.folder.name,
  {
    drop({ folder }, monitor) {
      //const item = monitor.getItem()
      //updateFolder(folder, { name: 'abc' })

      folder
      monitor
    }
  },
  connect => ({
    connectDropTarget: connect.dropTarget()
  })
)(SavedScriptsFolder)
