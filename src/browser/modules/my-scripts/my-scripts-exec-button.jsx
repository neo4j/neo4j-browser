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

import controlsPlay from '../../icons/controls-play.svg'

export default function MyScriptsExecButton ({ onExec }) {
  return (
    <button
      className='my-scripts__button my-scripts__exec-button'
      onClick={onExec}
    >
      <SVGInline
        accessibilityLabel='Run script'
        svg={controlsPlay}
        width='15px'
      />
    </button>
  )
}

MyScriptsExecButton.propTypes = {
  onExec: PropTypes.func.isRequired
}
