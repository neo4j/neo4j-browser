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

interface SavedScriptsListItemProps {
  script: Favorite
  selectScript: (script: Favorite) => void
  execScript: (script: Favorite) => void
  renameScript?: (script: Favorite, name: string) => void
  removeScript?: (script: Favorite) => void
}

function getScriptDisplayName(script: Favorite): string {
  const nameLine = script.content.split('\n')[0]
  return nameLine.startsWith('//') ? nameLine.substr(2).trimLeft() : nameLine
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
    setIsEditing,
    setNameValue
  } = useNameUpdate(
    displayName,
    name => renameScript && renameScript(script, name)
  )
  const blurRef = useCustomBlur(() => setIsEditing(false))
  const canRunScript = !script.not_executable && !isEditing
  const drag = useDrag({
    item: { id: script.id, type: 'script' }
  })[1]

  return (
    <SavedScriptsListItemMain ref={blurRef} className="saved-scripts-list-item">
      {isEditing ? (
        <SavedScriptsInput
          className="saved-scripts-list-item__name-input"
          type="text"
          autoFocus
          onKeyPress={({ key }) => {
            key === 'Enter' && setIsEditing(false)
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
        {renameScript && !isEditing && (
          <EditButton onClick={() => setIsEditing(!isEditing)} />
        )}
        {canRunScript && <RunButton onClick={() => execScript(script)} />}
      </SavedScriptsButtonWrapper>
    </SavedScriptsListItemMain>
  )
}

export default SavedScriptsListItem
