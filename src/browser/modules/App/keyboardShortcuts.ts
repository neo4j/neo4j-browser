import { useEffect } from 'react'
import { FOCUS, EXPAND, CARDSIZE } from 'shared/modules/editor/editorDuck'
import { Bus } from 'suber'

const keycodes = {
  27: 'esc',
  esc: 27
}

export function useKeyboardShortcuts(bus: Bus): void {
  const trigger = (msg: string): void => bus && bus.send(msg, null)

  const focusEditorOnSlash = (e: KeyboardEvent): void => {
    const tagName = (e.target as HTMLElement).tagName
    const writingText = ['INPUT', 'TEXTAREA'].indexOf(tagName) > -1
    const typedSlash = e.key === '/'

    if (!writingText && typedSlash) {
      trigger(FOCUS)
    }
  }

  const expandEditorOnEsc = (e: KeyboardEvent): void => {
    if (e.keyCode === keycodes.esc) {
      trigger(EXPAND)
    }
  }

  const cardSizeShortcut = (e: KeyboardEvent): void => {
    if (e.ctrlKey && e.key === 'b') {
      trigger(CARDSIZE)
    }
  }

  const keyboardShortcuts = [
    focusEditorOnSlash,
    expandEditorOnEsc,
    cardSizeShortcut
  ]

  useEffect(() => {
    keyboardShortcuts.forEach(shortcut =>
      document.addEventListener('keyup', shortcut)
    )

    return (): void =>
      keyboardShortcuts.forEach(shortcut =>
        document.removeEventListener('keyup', shortcut)
      )
  }, [])
}
