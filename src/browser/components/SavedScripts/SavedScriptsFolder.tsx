import React, { useState } from 'react'
import { lowerCase, map, sortBy, without } from 'lodash-es'
import { DropTarget, DragElementWrapper } from 'react-dnd'
import { Script, FolderUpdate } from './types'

import {
  addScriptPathPrefix,
  getScriptDisplayName,
  omitScriptPathPrefix
} from './utils'
import { useCustomBlur, useNameUpdate } from './hooks'

import SavedScriptsListItem from './SavedScriptsListItem'
import { EditButton, RemoveButton } from './SavedScriptsButton'
import {
  SavedScriptsCollapseMenuIcon,
  SavedScriptsExpandMenuRightIcon
} from 'browser-components/icons/Icons'

import {
  SavedScriptsButtonWrapper,
  SavedScriptsFolderBody,
  SavedScriptsFolderCollapseIcon,
  SavedScriptsFolderHeader,
  SavedScriptsFolderLabel,
  SavedScriptsFolderMain,
  SavedScriptsInput
} from './styled'

interface SavedScriptsFolderProps {
  isRoot?: boolean
  scriptsNamespace: string
  allFolderNames: string[]
  folderName: string
  scripts: Script[]
  isProjectFiles?: boolean
  selectScript?: (script: Script) => void
  removeScript?: (script: Script) => void
  execScript?: (script: Script) => void
  updateFolder: (scripts: Script[], updates: FolderUpdate) => void
  removeFolder?: (scripts: Script[]) => void
  isStatic?: boolean
}
type DropProp = {
  connectDropTarget: DragElementWrapper<any>
}

const noOp = () => {
  /* No operation */
}

function SavedScriptsFolder({
  isRoot = false,
  scriptsNamespace,
  folderName,
  scripts,
  isProjectFiles,
  isStatic,
  selectScript = noOp,
  execScript = noOp,
  removeScript = noOp,
  removeFolder = noOp,
  updateFolder,
  connectDropTarget
}: SavedScriptsFolderProps & DropProp) {
  const sortedScripts = sortBy(scripts, script =>
    lowerCase(getScriptDisplayName(script))
  )
  const [isEditing, labelInput, setIsEditing, setLabelInput] = useNameUpdate(
    folderName,
    name =>
      updateFolder(scripts, {
        isFolderName: true,
        path: addScriptPathPrefix(scriptsNamespace, name)
      })
  )
  const [expanded, setExpanded] = useState(false)
  const [blurRef] = useCustomBlur(() => setIsEditing(false))

  if (isRoot) {
    return connectDropTarget(
      <div style={{ paddingTop: 16 }}>
        <SavedScriptsFolderMain className="saved-scripts-folder saved-scripts-folder--root">
          {map(sortedScripts, (script, index) => (
            <SavedScriptsListItem
              key={`my-script-${script.id || index}`}
              isStatic={isStatic}
              script={script}
              isProjectFiles={isProjectFiles}
              selectScript={selectScript}
              execScript={execScript}
              updateScript={(script: Script, payload: FolderUpdate) =>
                updateFolder([script], payload)
              }
              removeScript={removeScript}
            />
          ))}
        </SavedScriptsFolderMain>
      </div>
    )
  }

  return connectDropTarget(
    <div data-testid={`savedScriptsFolder-${folderName}`}>
      <SavedScriptsFolderMain className="saved-scripts-folder">
        <SavedScriptsFolderHeader
          title={folderName}
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
              value={omitScriptPathPrefix(scriptsNamespace, labelInput)}
              onChange={({ target }) => setLabelInput(target.value)}
              data-testid="editSavedScriptFolderName"
            />
          ) : (
            <SavedScriptsFolderLabel
              className="saved-scripts-folder__label"
              data-testid={`expandFolder-${folderName}`}
              onClick={() => setExpanded(!expanded)}
            >
              <SavedScriptsFolderCollapseIcon className="saved-scripts-folder__collapse-icon">
                {expanded ? (
                  <SavedScriptsCollapseMenuIcon />
                ) : (
                  <SavedScriptsExpandMenuRightIcon />
                )}
              </SavedScriptsFolderCollapseIcon>
              {omitScriptPathPrefix(scriptsNamespace, folderName)}
            </SavedScriptsFolderLabel>
          )}
          <SavedScriptsButtonWrapper className="saved-scripts__button-wrapper">
            {isStatic || isProjectFiles || isEditing ? null : (
              <EditButton onClick={() => setIsEditing(!isEditing)} />
            )}
            {isStatic || isProjectFiles || !isEditing ? null : (
              <RemoveButton onClick={() => removeFolder(scripts)} />
            )}
          </SavedScriptsButtonWrapper>
        </SavedScriptsFolderHeader>
        {expanded ? (
          <SavedScriptsFolderBody className="saved-scripts-folder__body">
            {map(sortedScripts, (script, index) => (
              <SavedScriptsListItem
                key={`my-script-${script.id || index}`}
                isStatic={isStatic}
                script={script}
                isProjectFiles={isProjectFiles}
                selectScript={selectScript}
                execScript={execScript}
                updateScript={(script: Script, payload: any) =>
                  updateFolder([script], payload)
                }
                removeScript={removeScript}
              />
            ))}
          </SavedScriptsFolderBody>
        ) : null}
      </SavedScriptsFolderMain>
    </div>
  )
}

export default DropTarget<SavedScriptsFolderProps, DropProp>(
  ({ allFolderNames, folderName }) =>
    map(without(allFolderNames, folderName), name => name),
  {
    drop({ updateFolder, folderName }, monitor) {
      const item = monitor.getItem()

      updateFolder([item], { path: folderName })
    }
  },
  connect => ({
    connectDropTarget: connect.dropTarget()
  })
)(SavedScriptsFolder)
