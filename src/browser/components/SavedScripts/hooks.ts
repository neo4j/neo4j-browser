/*
 * Copyright (c) "Neo4j"
 * Neo4j Sweden AB [http://neo4j.com]
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
import { useEffect, useRef, useState } from 'react'

type NameUpdateFns = {
  isEditing: boolean
  doneEditing: () => void
  beginEditing: () => void
  currentNameValue: string
  setNameValue: (newName: string) => void
}
/**
 * Maintains a state of a name and calls update action whenever user exits editing
 */
export function useNameUpdate(name: string, update: () => void): NameUpdateFns {
  const [currentNameValue, setNameValue] = useState(name)
  const [isEditing, setIsEditing] = useState(false)

  // Reset starting name when favorite is renamed through editing the comment
  useEffect(() => setNameValue(name), [name])

  function doneEditing() {
    // only update if we have a change
    if (currentNameValue !== name) {
      update()
      setIsEditing(false)
    }
  }

  function beginEditing() {
    setIsEditing(true)
  }

  return {
    isEditing,
    beginEditing,
    doneEditing,
    currentNameValue,
    setNameValue
  }
}

/**
 * Fires an onBlur only when clicked outside ref
 */
export function useCustomBlur(
  onBlur: () => void
): React.RefObject<HTMLDivElement> {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const clickHandler = (event: Event) => {
      // We can't technically be sure the event target is an element
      const clickedEl = event.target
      if (
        ref.current &&
        clickedEl instanceof Element &&
        !ref.current.contains(clickedEl)
      ) {
        onBlur()
      }
    }
    document.addEventListener('mousedown', clickHandler)

    return () => {
      document.removeEventListener('mousedown', clickHandler)
    }
  }, [onBlur])

  return ref
}
