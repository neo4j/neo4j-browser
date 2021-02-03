import React, { useState } from 'react'
import { useDrag } from 'react-dnd'
import { useCustomBlur, useNameUpdate } from './hooks'
import { RunButton } from './SavedScriptsButton'
import {
  SavedScriptsButtonWrapper,
  SavedScriptsInput,
  SavedScriptsListItemDisplayName,
  SavedScriptsListItemMain
} from './styled'
import { Favorite } from 'shared/modules/favorites/favoritesDuck'
import { getScriptDisplayName } from './utils'
import styled from 'styled-components'
import { PinIcon } from 'browser-components/icons/Icons'

interface SavedScriptsListItemProps {
  script: Favorite
  selectScript: () => void
  execScript: () => void
  onClick?: (e: React.MouseEvent) => void
  isSelected?: boolean
  renameScript?: (name: string) => void
  removeScript?: () => void
  duplicateScript?: () => void
}

function SavedScriptsListItem({
  script,
  selectScript,
  execScript,
  renameScript,
  removeScript,
  duplicateScript,
  onClick,
  isSelected
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
    () => renameScript && renameScript(currentNameValue)
  )
  const blurRef = useCustomBlur(doneEditing)
  const drag = useDrag({
    item: { id: script.id, type: 'script' }
  })[1]
  const [showThing, set] = useState(false) // testa :active ist för denna proppen
  const blurRef2 = useCustomBlur(() => set(false))

  const canRunScript = !script.not_executable && !isEditing

  return (
    <SavedScriptsListItemMain
      isSelected={isSelected}
      stayVisible={showThing || isSelected}
      ref={blurRef}
      className="saved-scripts-list-item"
      onClick={onClick}
    >
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
          onClick={() => !isEditing && selectScript()}
          ref={drag}
        >
          {displayName}
        </SavedScriptsListItemDisplayName>
      )}
      <SavedScriptsButtonWrapper className="saved-scripts__button-wrapper">
        <span
          className="saved-scripts-hidden-more-info"
          onClick={() => set(t => !t)}
          style={{ position: 'relative' }}
        >
          <PinIcon />
          {showThing && (
            <Overlay ref={blurRef2}>
              {removeScript && <Item onClick={removeScript}> Delete </Item>}
              <Separator />
              {renameScript && <Item onClick={beginEditing}> Rename </Item>}
              {<Item onClick={selectScript}> Edit content</Item>}
              {<Item onClick={execScript}> Run </Item>}
              {<Item onClick={duplicateScript}> Duplicate </Item>}
            </Overlay>
          )}
        </span>
        {canRunScript && <RunButton onClick={execScript} />}
      </SavedScriptsButtonWrapper>
    </SavedScriptsListItemMain>
  )
}

const Overlay = styled.div`
  color: black;
  padding-top: 5px;
  padding-bottom: 5px;
  position: absolute;
  width: 156px;
  left: -156px;
  top: -3px;
  z-index: 999;
  border: 1px solid transparent;
  background-color: ${props => props.theme.secondaryBackground};
  border: ${props => props.theme.frameBorder};

  box-shadow: 0px 0px 2px rgba(52, 58, 67, 0.1),
    0px 1px 2px rgba(52, 58, 67, 0.08), 0px 1px 4px rgba(52, 58, 67, 0.08);
  border-radius: 2px;
`
const Item = styled.div`
  color: black;
  cursor: pointer;
  width: 100%;
  padding-left: 5px;

  &:hover {
    background-color: ${props => props.theme.primaryBackground};
  }
`

const Separator = styled.div`
  border-bottom: 1px solid rgb(77, 74, 87, 0.3);
`

export default SavedScriptsListItem
