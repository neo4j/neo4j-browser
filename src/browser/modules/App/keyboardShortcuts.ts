import { useEffect } from 'react'
import { FOCUS, EXPAND, CARDSIZE } from 'shared/modules/editor/editorDuck'
import { Bus } from 'suber'

export const isMac = /Mac|iPad/.test(navigator.platform)
const modKey = isMac ? 'metaKey' : 'ctrlKey'

export const isWindows = /Win32/.test(navigator.platform)

type ModifierKey = 'metaKey' | 'altKey' | 'ctrlKey'
const printModifiers: Record<ModifierKey, string> = {
  altKey: isMac ? '⌥' : 'alt',
  metaKey: isMac ? '⌘' : 'win',
  ctrlKey: isMac ? '⌃' : 'ctrl'
}

const encodeKey: Record<string, number> = { c: 67, f: 70, '/': 55 }
interface Shortcut {
  modifyers: ModifierKey[]
  key: string
}
export const OLD_FULLSCREEN_SHORTCUT: Shortcut = {
  modifyers: [],
  key: 'Escape'
}
export const FULLSCREEN_SHORTCUT: Shortcut = {
  modifyers: [modKey, 'altKey'],
  key: 'f'
}
export const CARDSIZE_SHORTCUT: Shortcut = {
  modifyers: [modKey, 'altKey'],
  key: 'c'
}
export const FOCUS_SHORTCUT: Shortcut = {
  modifyers: [],
  key: '/'
}

export function printShortcut(s: Shortcut): string {
  return s.modifyers
    .map(mod => printModifiers[mod])
    .concat(s.key.toUpperCase())
    .join(isMac ? '' : ' + ')
}

function matchesShortcut(e: KeyboardEvent, shortcut: Shortcut): boolean {
  const hasCorrectModifiers = shortcut.modifyers.every(mod => e[mod])
  // comparing keys instead of keycode is preferable because it
  // respects keyboard layouts, since using alt changes what key is sent,
  // we need to fall back to keycode (keyboard location) on some shortcuts
  const shortcutUsesAlt = shortcut.modifyers.includes('altKey')
  const correctKey = shortcutUsesAlt
    ? e.keyCode === encodeKey[shortcut.key]
    : e.key === shortcut.key

  return hasCorrectModifiers && correctKey
}

function isOutsideTextArea(e: KeyboardEvent): boolean {
  const tagName = (e.target as HTMLElement).tagName
  return ['INPUT', 'TEXTAREA'].indexOf(tagName) === -1
}

export function useKeyboardShortcuts(bus: Bus): void {
  const trigger = (msg: string): void => bus && bus.send(msg, null)

  const focusEditorOnSlash = (e: KeyboardEvent): void => {
    if (isOutsideTextArea(e) && matchesShortcut(e, FOCUS_SHORTCUT)) {
      e.preventDefault()
      trigger(FOCUS)
    }
  }

  const fullscreenEditor = (e: KeyboardEvent): void => {
    if (
      matchesShortcut(e, FULLSCREEN_SHORTCUT) ||
      matchesShortcut(e, OLD_FULLSCREEN_SHORTCUT)
    ) {
      e.preventDefault()
      trigger(EXPAND)
    }
  }

  const cardSizeShortcut = (e: KeyboardEvent): void => {
    if (matchesShortcut(e, CARDSIZE_SHORTCUT)) {
      e.preventDefault()
      trigger(CARDSIZE)
    }
  }

  const keyboardShortcuts = [
    focusEditorOnSlash,
    fullscreenEditor,
    cardSizeShortcut
  ]

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
