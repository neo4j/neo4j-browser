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

import React, { useContext } from 'react'
import PropTypes from 'prop-types'
import { ThemeContext } from 'styled-components'

import { ENTER_KEY_CODE } from './my-scripts.constants'
import {
  getScriptDisplayName,
  getScriptDisplayNameStyleFromTheme
} from './my-scripts.utils'
import { useCustomBlur, useScriptDrag, useNameUpdate } from './my-scripts.hooks'

import MyScriptsExecButton from './my-scripts-exec-button'
import MyScriptsEditButton from './my-scripts-edit-button'
import MyScriptsRemoveButton from './my-scripts-remove-button'

export default function MyScriptsListItem ({
  isStatic,
  script,
  onSelectScript,
  onExecScript,
  onUpdateScript,
  onRemoveScript
}) {
  const displayName = getScriptDisplayName(script)
  const theme = useContext(ThemeContext) // @todo: remove coupling
  const [isEditing, nameValue, setIsEditing, setLabelInput] = useNameUpdate(
    displayName,
    name => onUpdateScript(script, { name })
  )
  const [dragRef] = useScriptDrag(script)
  const [blurRef] = useCustomBlur(() => setIsEditing(false))

  return (
    <div ref={blurRef} className='my-scripts-list-item'>
      {isEditing ? (
        <input
          className='my-scripts-list-item__name-input'
          type='text'
          autoFocus
          onKeyPress={({ charCode }) => {
            charCode === ENTER_KEY_CODE && setIsEditing(false)
          }}
          value={nameValue}
          onChange={({ target }) => setLabelInput(target.value)}
        />
      ) : (
        <div
          ref={dragRef}
          className='my-scripts-list-item__display-name'
          style={getScriptDisplayNameStyleFromTheme({ theme })}
          onClick={() => !isEditing && onSelectScript(script)}
        >
          {displayName}
        </div>
      )}
      <div className='my-scripts__button-wrapper'>
        {isStatic || isEditing ? null : (
          <MyScriptsEditButton onEdit={() => setIsEditing(!isEditing)} />
        )}
        {isStatic || !isEditing ? null : (
          <MyScriptsRemoveButton onRemove={() => onRemoveScript(script)} />
        )}
        {script.isSuggestion || isEditing ? null : (
          <MyScriptsExecButton onExec={() => onExecScript(script)} />
        )}
      </div>
    </div>
  )
}

MyScriptsListItem.propTypes = {
  isStatic: PropTypes.bool,
  script: PropTypes.object.isRequired,
  onSelectScript: PropTypes.func.isRequired,
  onExecScript: PropTypes.func.isRequired,
  onUpdateScript: PropTypes.func.isRequired,
  onRemoveScript: PropTypes.func.isRequired
}
