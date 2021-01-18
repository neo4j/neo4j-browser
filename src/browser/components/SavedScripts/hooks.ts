import { useState, useEffect, useRef } from 'react'

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
