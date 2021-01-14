import React from 'react'
import { DragSource } from 'react-dnd'

import { FolderUpdate, Script } from './types'

import { getScriptDisplayName } from './utils'
import { useCustomBlur, useNameUpdate } from './hooks'

import { RemoveButton, RunButton, EditButton } from './SavedScriptsButton'

import {
  SavedScriptsButtonWrapper,
  SavedScriptsInput,
  SavedScriptsListItemDisplayName,
  SavedScriptsListItemMain
} from './styled'

export interface SavedScriptsListItemProps {
  isStatic?: boolean
  script: Script
  isProjectFiles?: boolean
  selectScript: (script: Script) => void
  execScript: (script: Script) => void
  updateScript: (script: Script, updates: FolderUpdate) => void
  removeScript: (script: Script) => void
  connectDragSource?: any
}

export default DragSource<SavedScriptsListItemProps>(
  ({ script }) => script.path,
  {
    beginDrag: ({ script }) => script
  },
  connect => ({
    connectDragSource: connect.dragSource()
  })
)(SavedScriptsListItem)

function SavedScriptsListItem({
  isStatic,
  script,
  isProjectFiles,
  selectScript,
  execScript,
  updateScript,
  removeScript,
  connectDragSource
}: SavedScriptsListItemProps) {
  const displayName = getScriptDisplayName(script)
  const [
    isEditing,
    nameValue,
    setIsEditing,
    setLabelInput
  ] = useNameUpdate(displayName, name => updateScript(script, { name }))
  const [blurRef] = useCustomBlur(() => setIsEditing(false))

  return (
    <SavedScriptsListItemMain ref={blurRef} className="saved-scripts-list-item">
      {isEditing && !isProjectFiles ? (
        <SavedScriptsInput
          className="saved-scripts-list-item__name-input"
          type="text"
          autoFocus
          onKeyPress={({ key }) => {
            key === 'Enter' && setIsEditing(false)
          }}
          value={nameValue}
          onChange={({ target }) => setLabelInput(target.value)}
        />
      ) : (
        <SavedScriptsListItemDisplayName
          className="saved-scripts-list-item__display-name"
          data-testid={`scriptTitle-${displayName}`}
          onClick={() => (isProjectFiles || !isEditing) && selectScript(script)}
        >
          {connectDragSource!(<span>{displayName}</span>)}
        </SavedScriptsListItemDisplayName>
      )}
      <SavedScriptsButtonWrapper className="saved-scripts__button-wrapper">
        {isStatic || isEditing ? (
          <RemoveButton onClick={() => removeScript(script)} />
        ) : (
          <EditButton onClick={() => setIsEditing(!isEditing)} />
        )}

        {script.isSuggestion || isEditing || (
          <RunButton onClick={() => execScript(script)} />
        )}
      </SavedScriptsButtonWrapper>
    </SavedScriptsListItemMain>
  )
}
