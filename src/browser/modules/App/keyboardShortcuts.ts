import { useEffect } from 'react'
import { FOCUS, EXPAND, CARDSIZE } from 'shared/modules/editor/editorDuck'
import { Bus } from 'suber'

const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.platform)
const modKey = isMac ? 'metaKey' : 'ctrlKey'

type ModifyerKey = 'metaKey' | 'altKey' | 'ctrlKey'
const printModifyers: Record<ModifyerKey, string> = {
  altKey: isMac ? '⌥' : 'alt',
  metaKey: isMac ? '⌘' : 'win',
  ctrlKey: isMac ? '⌃' : 'ctrl'
}

const encodeKey: Record<string, number> = { c: 67, f: 70, '/': 55 }
const decodeKeycode: Record<number, string> = Object.entries(encodeKey).reduce(
  (acc: Record<number, string>, [char, keyCode]: [string, number]) => ({
    ...acc,
    [keyCode]: char
  }),
  {}
)

interface Shortcut {
  modifyers: ModifyerKey[]
  keyCode: number
}
export const FULLSCREEN_SHORTCUT: Shortcut = {
  modifyers: [modKey, 'altKey'],
  keyCode: encodeKey.f
}
export const CARDSIZE_SHORTCUT: Shortcut = {
  modifyers: [modKey, 'altKey'],
  keyCode: encodeKey.c
}
export const FOCUS_SHORTCUT: Shortcut = {
  modifyers: [],
  keyCode: encodeKey['/']
}

export function printShortcut(s: Shortcut): string {
  return s.modifyers
    .map(mod => printModifyers[mod])
    .concat(decodeKeycode[s.keyCode])
    .join(' ')
}

function matchesShortcut(e: KeyboardEvent, shortcut: Shortcut): boolean {
  const hasCorrectModifyers = shortcut.modifyers.every(mod => e[mod])
  return hasCorrectModifyers && e.keyCode === shortcut.keyCode
}

function isOutsideTextArea(e: KeyboardEvent): boolean {
  const tagName = (e.target as HTMLElement).tagName
  return ['INPUT', 'TEXTAREA'].indexOf(tagName) > -1
}

export function useKeyboardShortcuts(bus: Bus): void {
  const trigger = (msg: string): void => bus && bus.send(msg, null)

  const focusEditorOnSlash = (e: KeyboardEvent): void => {
    if (isOutsideTextArea(e) && matchesShortcut(e, FOCUS_SHORTCUT)) {
      trigger(FOCUS)
    }
  }

  const expandEditor = (e: KeyboardEvent): void => {
    e.preventDefault()
    if (matchesShortcut(e, FULLSCREEN_SHORTCUT)) {
      trigger(EXPAND)
    }
  }

  const cardSizeShortcut = (e: KeyboardEvent): void => {
    e.preventDefault()
    if (matchesShortcut(e, CARDSIZE_SHORTCUT)) {
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
