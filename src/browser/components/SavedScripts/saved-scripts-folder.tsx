import React, { useState } from 'react'
import { lowerCase, map, sortBy, without } from 'lodash-es'
import { DropTarget } from 'react-dnd'

import { AnyFunc, IScript } from './types'

import {
  addScriptPathPrefix,
  getScriptDisplayName,
  omitScriptPathPrefix
} from './saved-scripts.utils'
import { useCustomBlur, useNameUpdate } from './saved-scripts.hooks'

import SavedScriptsListItem from './saved-scripts-list-item'
import { EditButton, RemoveButton } from './SavedScriptsButton'
import { CollapseMenuIcon, ExpandMenuRightIcon } from './icons'

import {
  SavedScriptsButtonWrapper,
  SavedScriptsFolderBody,
  SavedScriptsFolderCollapseIcon,
  SavedScriptsFolderHeader,
  SavedScriptsFolderLabel,
  SavedScriptsFolderMain,
  SavedScriptsInput
} from './saved-scripts.styled'

export interface ISavedScriptsFolderProps {
  isRoot?: boolean
  scriptsNamespace: string
  allFolderNames: string[]
  folderName: string
  scripts: IScript[]
  isProjectFiles?: boolean
  onSelectScript: AnyFunc
  onExecScript: AnyFunc
  onRemoveScript: AnyFunc
  onUpdateFolder: AnyFunc
  onRemoveFolder: AnyFunc
  isStatic?: boolean
  connectDropTarget?: AnyFunc
}

export default DropTarget<ISavedScriptsFolderProps>(
  ({ allFolderNames, folderName }) =>
    map(without(allFolderNames, folderName), name => name),
  {
    drop({ onUpdateFolder, folderName }, monitor) {
      const item = monitor.getItem()

      onUpdateFolder([item], { path: folderName })
    }
  },
  connect => ({
    connectDropTarget: connect.dropTarget()
  })
)(SavedScriptsFolder)

function SavedScriptsFolder({
  isRoot = false,
  scriptsNamespace,
  folderName,
  scripts,
  isProjectFiles,
  isStatic,
  onSelectScript,
  onExecScript,
  onRemoveScript,
  onUpdateFolder,
  onRemoveFolder,
  connectDropTarget
}: ISavedScriptsFolderProps) {
  const sortedScripts = sortBy(scripts, script =>
    lowerCase(getScriptDisplayName(script))
  )
  const [isEditing, labelInput, setIsEditing, setLabelInput] = useNameUpdate(
    folderName,
    name =>
      onUpdateFolder(scripts, {
        isFolderName: true,
        path: addScriptPathPrefix(scriptsNamespace, name)
      })
  )
  const [expanded, setExpanded] = useState(false)
  const [blurRef] = useCustomBlur(() => setIsEditing(false))

  if (isRoot) {
    return connectDropTarget!(
      <div style={{ paddingTop: 16 }}>
        <SavedScriptsFolderMain className="saved-scripts-folder saved-scripts-folder--root">
          {map(sortedScripts, (script, index) => (
            <SavedScriptsListItem
              key={`my-script-${script.id || index}`}
              isStatic={isStatic}
              script={script}
              isProjectFiles={isProjectFiles}
              onSelectScript={onSelectScript}
              onExecScript={onExecScript}
              onUpdateScript={(script: IScript, payload: any) =>
                onUpdateFolder([script], payload)
              }
              onRemoveScript={onRemoveScript}
            />
          ))}
        </SavedScriptsFolderMain>
      </div>
    )
  }

  return connectDropTarget!(
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
                {expanded ? <CollapseMenuIcon /> : <ExpandMenuRightIcon />}
              </SavedScriptsFolderCollapseIcon>
              {omitScriptPathPrefix(scriptsNamespace, folderName)}
            </SavedScriptsFolderLabel>
          )}
          <SavedScriptsButtonWrapper className="saved-scripts__button-wrapper">
            {isStatic || isProjectFiles || isEditing ? null : (
              <EditButton onClick={() => setIsEditing(!isEditing)} />
            )}
            {isStatic || isProjectFiles || !isEditing ? null : (
              <RemoveButton onClick={() => onRemoveFolder(scripts)} />
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
                onSelectScript={onSelectScript}
                onExecScript={onExecScript}
                onUpdateScript={(script: IScript, payload: any) =>
                  onUpdateFolder([script], payload)
                }
                onRemoveScript={onRemoveScript}
              />
            ))}
          </SavedScriptsFolderBody>
        ) : null}
      </SavedScriptsFolderMain>
    </div>
  )
}
