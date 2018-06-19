/*
 * Copyright (c) 2002-2018 "Neo4j, Inc"
 * Network Engine for Objects in Lund AB [http://neotechnology.com]
 *
 * This file is part of Neo4j.
 *
 * Neo4j is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import React from 'react'
import FrameTemplate from './FrameTemplate'
import * as e from 'services/exceptionMessages'
import { getErrorMessage } from 'services/exceptions'
import { PaddedDiv } from './styled'

const ErrorFrame = ({ frame }) => {
  const error = frame.error || false
  let errorContents = error.message || 'No error message found'
  if (error.type && typeof e[error.type] !== 'undefined') {
    errorContents = getErrorMessage(error)
  }
  return (
    <FrameTemplate
      header={frame}
      contents={
        <PaddedDiv>
          <pre>{errorContents}</pre>
        </PaddedDiv>
      }
    />
  )
}
export default ErrorFrame
