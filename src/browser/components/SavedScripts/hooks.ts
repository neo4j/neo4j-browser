import { useState, useEffect, useRef } from 'react'

/**
 * Maintains a state of a name and calls update action whenever user exits editing
 */
export function useNameUpdate(
  name: string,
  update: (name: string) => void
): {
  isEditing: boolean
  currentNameValue: string
  setIsEditing: (isEditing: boolean) => void
  setNameValue: (newName: string) => void
} {
  const [currentNameValue, setNameValue] = useState(name)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (!isEditing && currentNameValue !== name) {
      update(currentNameValue)
    }
  }, [isEditing, currentNameValue, name, update])

  return { isEditing, currentNameValue, setIsEditing, setNameValue }
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
