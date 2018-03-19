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
import { createErrorObject } from 'services/exceptions'
import { errorMessageFormater } from './errorMessageFormater'
import {
  StyledCypherErrorMessage,
  StyledHelpContent,
  StyledH4,
  StyledPreformattedArea,
  StyledHelpDescription,
  StyledDiv,
  StyledHelpFrame
} from './styled'

export const ErrorView = ({ frame }) => {
  if (!frame) return null
  const error = frame.error || false
  let errorContents = error.message || 'No error message found'
  let errorCode = error.type || error.code || 'UndefinedError'
  if (!error.message && errorCode && typeof e[errorCode] !== 'undefined') {
    const eObj = createErrorObject(errorCode, error)
    errorContents = eObj.message
  }
  const fullError = errorMessageFormater(errorCode, errorContents)
  return (
    <StyledHelpFrame>
      <StyledHelpContent>
        <StyledHelpDescription>
          <StyledCypherErrorMessage>ERROR</StyledCypherErrorMessage>
          <StyledH4>{errorCode}</StyledH4>
        </StyledHelpDescription>
        <StyledDiv>
          <StyledPreformattedArea>{fullError.message}</StyledPreformattedArea>
        </StyledDiv>
      </StyledHelpContent>
    </StyledHelpFrame>
  )
}

const ErrorFrame = ({ frame }) => {
  return <FrameTemplate header={frame} contents={<ErrorView frame={frame} />} />
}
export default ErrorFrame
