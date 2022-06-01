/*
 * Copyright (c) "Neo4j"
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
import React, { useEffect, useRef } from 'react'

import { EyeIcon, EyeSlashIcon } from 'browser-components/icons/LegacyIcons'

import {
  StyledConnectionTextInput,
  StyledRevealIconWrapper,
  StyledRevealablePasswordWrapper
} from './styled'

export default function RevealablePasswordInput({
  isRevealed,
  toggleReveal,
  ...props
}: any) {
  const inputRef = useReveal(isRevealed)

  return (
    <StyledRevealablePasswordWrapper>
      <StyledConnectionTextInput ref={inputRef} {...props} />
      <StyledRevealIconWrapper onClick={toggleReveal}>
        {isRevealed ? <EyeIcon /> : <EyeSlashIcon />}
      </StyledRevealIconWrapper>
    </StyledRevealablePasswordWrapper>
  )
}

function useReveal(isRevealed: boolean) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!inputRef.current) {
      return
    }

    inputRef.current.type = isRevealed ? 'text' : 'password'
  }, [isRevealed])

  return inputRef
}
