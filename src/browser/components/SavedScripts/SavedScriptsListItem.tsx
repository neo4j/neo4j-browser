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
  const nameBlurRef = useCustomBlur(doneEditing)
  const overlayBlurRef = useCustomBlur(() => setShowOverlay(false))
  const drag = useDrag({
    item: { id: script.id, type: 'script' }
  })[1]
  const [showOverlay, setShowOverlay] = useState(false)
  const toggleOverlay = () => setShowOverlay(t => !t)
  const canRunScript = !script.not_executable && !isEditing

  return (
    <span ref={drag}>
      <SavedScriptsListItemMain
        isSelected={isSelected}
        stayVisible={showOverlay || isSelected}
        ref={nameBlurRef}
        onClick={onClick}
      >
        {isEditing ? (
          <SavedScriptsInput
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
            data-testid={`scriptTitle-${displayName}`}
            onClick={() => script.isStatic && selectScript()}
          >
            {displayName}
          </SavedScriptsListItemDisplayName>
        )}
        <SavedScriptsButtonWrapper>
          <OverlayContainer
            className="saved-scripts-hidden-more-info"
            onClick={toggleOverlay}
          >
            <PinIcon />
            {showOverlay && (
              <Overlay ref={overlayBlurRef}>
                {removeScript && <Item onClick={removeScript}> Delete </Item>}
                {removeScript && <Separator />}
                {renameScript && <Item onClick={beginEditing}> Rename </Item>}
                {<Item onClick={selectScript}> Edit content</Item>}
                {canRunScript && <Item onClick={execScript}> Run </Item>}
                {duplicateScript && (
                  <Item onClick={duplicateScript}> Duplicate </Item>
                )}
              </Overlay>
            )}
          </OverlayContainer>
          {canRunScript && <RunButton onClick={execScript} />}
        </SavedScriptsButtonWrapper>
      </SavedScriptsListItemMain>
    </span>
  )
}

const OverlayContainer = styled.span`
  position: relative;
`

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
