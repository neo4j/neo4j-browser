/*
 * Copyright (c) 2002-2019 "Neo4j,"
 * Neo4j Sweden AB [http://neo4j.com]
 * This file is part of Neo4j.
 * Neo4j is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { lowerCase, map, sortBy } from 'lodash-es'

import { ENTER_KEY_CODE } from './my-scripts.constants'
import {
  addScriptPathPrefix,
  getScriptDisplayName,
  omitScriptPathPrefix
} from './my-scripts.utils'
import { useCustomBlur, useFolderDrop, useNameUpdate } from './my-scripts.hooks'

import MyScriptsListItem from './my-scripts-list-item'
import MyScriptsEditButton from './my-scripts-edit-button'
import MyScriptsRemoveButton from './my-scripts-remove-button'
import {
  CollapseMenuIcon,
  ExpandMenuRightIcon
} from '../../components/icons/Icons'

export default function MyScriptsFolder ({
  isRoot,
  scriptsNamespace,
  allFolderNames,
  folderName,
  scripts,
  isStatic,
  onSelectScript,
  onExecScript,
  onRemoveScript,
  onUpdateFolder,
  onRemoveFolder
}) {
  const sortedScripts = sortBy(scripts, script =>
    lowerCase(getScriptDisplayName(script))
  )
  const [isEditing, labelInput, setIsEditing, setLabelInput] = useNameUpdate(
    folderName,
    name =>
      onUpdateFolder(scripts, {
        path: addScriptPathPrefix(scriptsNamespace, name)
      })
  )
  const [expanded, setExpanded] = useState(false)
  const [dropRef] = useFolderDrop(folderName, allFolderNames, onUpdateFolder)
  const [blurRef] = useCustomBlur(() => setIsEditing(false))

  if (isRoot) {
    return (
      <div ref={dropRef} className='my-scripts-folder my-scripts-folder--root'>
        {map(sortedScripts, (script, index) => (
          <MyScriptsListItem
            key={`my-script-${script.id || index}`}
            isStatic={isStatic}
            script={script}
            onSelectScript={onSelectScript}
            onExecScript={onExecScript}
            onUpdateScript={(script, payload) =>
              onUpdateFolder([script], payload)
            }
            onRemoveScript={onRemoveScript}
          />
        ))}
      </div>
    )
  }

  return (
    <div ref={dropRef} className='my-scripts-folder'>
      <div ref={blurRef} className='my-scripts-folder__header'>
        {isEditing ? (
          <input
            className='my-scripts-folder__label-input'
            type='text'
            autoFocus
            onKeyPress={({ charCode }) => {
              charCode === ENTER_KEY_CODE && setIsEditing(false)
            }}
            value={omitScriptPathPrefix(scriptsNamespace, labelInput)}
            onChange={({ target }) => setLabelInput(target.value)}
          />
        ) : (
          <div
            className='my-scripts-folder__label'
            onClick={() => setExpanded(!expanded)}
          >
            <span className='my-scripts-folder__collapse-icon'>
              {expanded ? <CollapseMenuIcon /> : <ExpandMenuRightIcon />}
            </span>
            {omitScriptPathPrefix(scriptsNamespace, folderName)}
          </div>
        )}
        <div className='my-scripts__button-wrapper'>
          {isStatic || isEditing ? null : (
            <MyScriptsEditButton onEdit={() => setIsEditing(!isEditing)} />
          )}
          {isStatic || !isEditing ? null : (
            <MyScriptsRemoveButton onRemove={() => onRemoveFolder(scripts)} />
          )}
        </div>
      </div>
      {expanded ? (
        <div className='my-scripts-folder__body'>
          {map(sortedScripts, (script, index) => (
            <MyScriptsListItem
              key={`my-script-${script.id || index}`}
              isStatic={isStatic}
              script={script}
              onSelectScript={onSelectScript}
              onExecScript={onExecScript}
              onUpdateScript={(script, payload) =>
                onUpdateFolder([script], payload)
              }
              onRemoveScript={onRemoveScript}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}

MyScriptsFolder.propTypes = {
  isRoot: PropTypes.bool,
  scriptsNamespace: PropTypes.string.isRequired,
  allFolderNames: PropTypes.array.isRequired,
  folderName: PropTypes.string.isRequired,
  scripts: PropTypes.array.isRequired,
  onSelectScript: PropTypes.func.isRequired,
  onExecScript: PropTypes.func.isRequired,
  onRemoveScript: PropTypes.func.isRequired,
  onRemoveFolder: PropTypes.func.isRequired,
  isStatic: PropTypes.bool
}

MyScriptsFolder.defaultProps = {
  isRoot: false
}
