import { useEffect } from 'react'
import { FOCUS, EXPAND, CARDSIZE } from 'shared/modules/editor/editorDuck'
import { Bus } from 'suber'

const keycodes = { c: 67, f: 70 }

const isOutsideTextArea = (e: KeyboardEvent): boolean => {
  const tagName = (e.target as HTMLElement).tagName
  return ['INPUT', 'TEXTAREA'].indexOf(tagName) > -1
}

export function useKeyboardShortcuts(bus: Bus): void {
  const trigger = (msg: string): void => bus && bus.send(msg, null)

  const focusEditorOnSlash = (e: KeyboardEvent): void => {
    if (isOutsideTextArea(e) && e.key === '/') {
      trigger(FOCUS)
    }
  }

  const expandEditor = (e: KeyboardEvent): void => {
    e.preventDefault()
    if ((e.ctrlKey || e.metaKey) && e.altKey && e.keyCode === keycodes.f) {
      trigger(EXPAND)
    }
  }

  const cardSizeShortcut = (e: KeyboardEvent): void => {
    e.preventDefault()
    if ((e.ctrlKey || e.metaKey) && e.altKey && e.keyCode === keycodes.c) {
      trigger(CARDSIZE)
    }
  }

  const keyboardShortcuts = [focusEditorOnSlash, expandEditor, cardSizeShortcut]

  useEffect(() => {
    keyboardShortcuts.forEach(shortcut =>
      document.addEventListener('keydown', shortcut)
    )

    return (): void =>
      keyboardShortcuts.forEach(shortcut =>
        document.removeEventListener('keydown', shortcut)
      )
  }, [])
}
