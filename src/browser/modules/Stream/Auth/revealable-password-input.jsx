/*
 * Copyright (c) 2002-2020 "Neo4j,"
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
import React, { useEffect, useRef, useState } from 'react'
import { Icon } from 'semantic-ui-react'

import {
  StyledRevealablePasswordWrapper,
  StyledConnectionTextInput
} from './styled'

export default function RevealablePasswordInput({
  setRef,
  isRevealed,
  toggleReveal,
  ...props
}) {
  const inputRef = useReveal(isRevealed)

  return (
    <StyledRevealablePasswordWrapper>
      <StyledConnectionTextInput ref={inputRef} {...props} />
      <Icon name={isRevealed ? 'eye slash' : 'eye'} onClick={toggleReveal} />
    </StyledRevealablePasswordWrapper>
  )
}

function useReveal(isRevealed) {
  const inputRef = useRef(null)

  useEffect(() => {
    if (!inputRef.current) {
      return
    }

    inputRef.current.type = isRevealed ? 'text' : 'password'

    return () => {
      inputRef.current.type = 'password'
    }
  }, [inputRef, isRevealed])

  return inputRef
}
