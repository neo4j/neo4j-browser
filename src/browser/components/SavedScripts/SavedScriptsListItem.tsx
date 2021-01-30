import React from 'react'
import { useDrag } from 'react-dnd'
import { useCustomBlur, useNameUpdate } from './hooks'
import { RemoveButton, RunButton, EditButton } from './SavedScriptsButton'
import {
  SavedScriptsButtonWrapper,
  SavedScriptsInput,
  SavedScriptsListItemDisplayName,
  SavedScriptsListItemMain
} from './styled'
import { Favorite } from 'shared/modules/favorites/favoritesDuck'
import { getScriptDisplayName } from './utils'

interface SavedScriptsListItemProps {
  script: Favorite
  selectScript: (script: Favorite) => void
  execScript: (script: Favorite) => void
  renameScript?: (script: Favorite, name: string) => void
  removeScript?: (script: Favorite) => void
}

function SavedScriptsListItem({
  script,
  selectScript,
  execScript,
  renameScript,
  removeScript
}: SavedScriptsListItemProps): JSX.Element {
  const displayName = getScriptDisplayName(script)
  const {
    isEditing,
    currentNameValue,
    beginEditing,
    doneEditing,
    setNameValue
  } = useNameUpdate(
    displayName,
    () => renameScript && renameScript(script, currentNameValue)
  )
  const blurRef = useCustomBlur(doneEditing)
  const drag = useDrag({
    item: { id: script.id, type: 'script' }
  })[1]

  const canRunScript = !script.not_executable && !isEditing

  return (
    <SavedScriptsListItemMain ref={blurRef} className="saved-scripts-list-item">
      {isEditing ? (
        <SavedScriptsInput
          className="saved-scripts-list-item__name-input"
          type="text"
          autoFocus
          onKeyPress={({ key }) => {
            key === 'Enter' && doneEditing()
          }}
          value={currentNameValue}
          onChange={e => setNameValue(e.target.value)}
        />
      ) : (
        <SavedScriptsListItemDisplayName
          className="saved-scripts-list-item__display-name"
          data-testid={`scriptTitle-${displayName}`}
          onClick={() => !isEditing && selectScript(script)}
          ref={drag}
        >
          {displayName}
        </SavedScriptsListItemDisplayName>
      )}
      <SavedScriptsButtonWrapper className="saved-scripts__button-wrapper">
        {removeScript && isEditing && (
          <RemoveButton onClick={() => removeScript(script)} />
        )}
        {renameScript && !isEditing && <EditButton onClick={beginEditing} />}
        {canRunScript && <RunButton onClick={() => execScript(script)} />}
      </SavedScriptsButtonWrapper>
    </SavedScriptsListItemMain>
  )
}

export default SavedScriptsListItem
