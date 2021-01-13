import React from 'react'
import { DragSource } from 'react-dnd'

import { AnyFunc, IScript } from './types'

import { ENTER_KEY_CODE } from './saved-scripts.constants'
import { getScriptDisplayName } from './saved-scripts.utils'
import { useCustomBlur, useNameUpdate } from './saved-scripts.hooks'

import SavedScriptsExecButton from './saved-scripts-exec-button'
import SavedScriptsEditButton from './saved-scripts-edit-button'
import SavedScriptsRemoveButton from './saved-scripts-remove-button'

import {
  SavedScriptsButtonWrapper,
  SavedScriptsInput,
  SavedScriptsListItemDisplayName,
  SavedScriptsListItemMain
} from './saved-scripts.styled'

export interface ISavedScriptsListItemProps {
  isStatic?: boolean
  script: IScript
  isProjectFiles?: boolean
  onSelectScript: AnyFunc
  onExecScript: AnyFunc
  onUpdateScript: AnyFunc
  onRemoveScript: AnyFunc
  connectDragSource?: AnyFunc
}

export default DragSource<ISavedScriptsListItemProps>(
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
  onSelectScript,
  onExecScript,
  onUpdateScript,
  onRemoveScript,
  connectDragSource
}: ISavedScriptsListItemProps) {
  const displayName = getScriptDisplayName(script)
  const [
    isEditing,
    nameValue,
    setIsEditing,
    setLabelInput
  ] = useNameUpdate(displayName, name => onUpdateScript(script, { name }))
  const [blurRef] = useCustomBlur(() => setIsEditing(false))

  return (
    <SavedScriptsListItemMain ref={blurRef} className="saved-scripts-list-item">
      {isEditing && !isProjectFiles ? (
        <SavedScriptsInput
          className="saved-scripts-list-item__name-input"
          type="text"
          autoFocus
          onKeyPress={({ charCode }) => {
            charCode === ENTER_KEY_CODE && setIsEditing(false)
          }}
          value={nameValue}
          onChange={({ target }) => setLabelInput(target.value)}
        />
      ) : (
        <SavedScriptsListItemDisplayName
          className="saved-scripts-list-item__display-name"
          onClick={() =>
            (isProjectFiles || !isEditing) && onSelectScript(script)
          }
        >
          {connectDragSource!(<span>{displayName}</span>)}
        </SavedScriptsListItemDisplayName>
      )}
      <SavedScriptsButtonWrapper className="saved-scripts__button-wrapper">
        {isStatic || isEditing ? null : (
          <SavedScriptsEditButton onEdit={() => setIsEditing(!isEditing)} />
        )}
        {isStatic || !isEditing ? null : (
          <SavedScriptsRemoveButton onRemove={() => onRemoveScript(script)} />
        )}
        {script.isSuggestion || isEditing ? null : (
          <SavedScriptsExecButton onExec={() => onExecScript(script)} />
        )}
      </SavedScriptsButtonWrapper>
    </SavedScriptsListItemMain>
  )
}
