import { useEffect } from 'react'
import { FOCUS, EXPAND } from 'shared/modules/editor/editorDuck'
import { Bus } from 'suber'

export function useKeyboardShortcuts(bus: Bus): void {
  // @ts-expect-error
  const trigger = (msg: string): void => bus && bus.send(msg)

  const focusEditorOnSlash = (e: KeyboardEvent): void => {
    // @ts-expect-error
    if (['INPUT', 'TEXTAREA'].indexOf(e.target.tagName) > -1) return
    if (e.key !== '/') return
    trigger(FOCUS)
  }
  const expandEditorOnEsc = (e: KeyboardEvent): void => {
    if (e.keyCode !== 27) return
    trigger(EXPAND)
  }
  const cardSizeShortcut = (e: KeyboardEvent): void => {
    if (e.keyCode !== 27) return
    trigger(EXPAND)
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
