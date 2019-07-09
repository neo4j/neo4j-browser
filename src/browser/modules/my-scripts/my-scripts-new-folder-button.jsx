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

import React from 'react'
import PropTypes from 'prop-types'
import SVGInline from 'react-svg-inline'

import folderAdd from '../../icons/folder-add.svg'

export default function MyScriptsNewFolderButton ({ disabled, onAdd }) {
  return (
    <button
      className='my-scripts__button my-scripts__new-folder-button'
      disabled={Boolean(disabled)}
      title='Add folder'
      onClick={onAdd}
    >
      <SVGInline accessibilityLabel='Add folder' svg={folderAdd} width='13px' />
    </button>
  )
}

MyScriptsNewFolderButton.propTypes = {
  disabled: PropTypes.bool,
  onAdd: PropTypes.func.isRequired
}
