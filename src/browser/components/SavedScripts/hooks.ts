import { useState, useEffect, useRef } from 'react'
import { isEmpty, indexOf, join, slice, without } from 'lodash-es'
import { Script, ScriptFolder, NewFolderPathGenerator } from './types'
import {
  getRootLevelFolder,
  getSubLevelFolders,
  sortAndGroupScriptsByPath
} from './utils'

/**
 * Maintains a state of script folders, separated into root and sub folders
 */
export function useScriptsFolders(
  namespace: string,
  scripts: Script[]
): [ScriptFolder | null, ScriptFolder[]] {
  const [sortedScriptGroups, setSortedScriptGroups] = useState(
    sortAndGroupScriptsByPath(namespace, scripts)
  )

  useEffect(() => {
    setSortedScriptGroups(sortAndGroupScriptsByPath(namespace, scripts))
  }, [scripts])

  return [
    getRootLevelFolder(namespace, sortedScriptGroups),
    getSubLevelFolders(namespace, sortedScriptGroups)
  ]
}

/**
 * Maintains a state of a name and calls update action whenever user exits editing
 */
export function useNameUpdate(
  name: string,
  update: (name: string) => void
): [boolean, string, (isEditing: boolean) => void, (newName: string) => void] {
  const [inputValue, setNameInput] = useState(name)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (!isEditing && inputValue !== name) {
      update(inputValue)
    }
  }, [isEditing])

  return [isEditing, inputValue, setIsEditing, setNameInput]
}

/**
 * Maintains a state of empty folders
 */
export function useEmptyFolders(
  namespace: string,
  pathGenerator: NewFolderPathGenerator,
  allSavedFolderNames: string[]
): [
  string[],
  boolean,
  () => void,
  (oldPath: string, newPath: string) => void,
  (path: string) => void
] {
  const [emptyFolders, setEmptyFolders] = useState([] as string[])
  const canAddFolder = isEmpty(emptyFolders)
  const addEmptyFolder = () =>
    setEmptyFolders([
      ...emptyFolders,
      pathGenerator(namespace, allSavedFolderNames)
    ])
  const removeEmptyFolder = (path: string) =>
    setEmptyFolders(without(emptyFolders, path))
  const updateEmptyFolder = (oldPath: string, newPath: string) => {
    const index = indexOf(emptyFolders, oldPath)

    setEmptyFolders([
      ...slice(emptyFolders, 0, index),
      newPath,
      ...slice(emptyFolders, index + 1)
    ])
  }

  useEffect(() => {
    setEmptyFolders(without(emptyFolders, ...allSavedFolderNames))
  }, [join(allSavedFolderNames)])

  return [
    emptyFolders,
    canAddFolder,
    addEmptyFolder,
    updateEmptyFolder,
    removeEmptyFolder
  ]
}

/**
 * Fires an onBlur only when clicked outside ref
 */
export function useCustomBlur(onBlur: () => void) {
  const ref = useRef<HTMLDivElement>(null)
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

  useEffect(() => {
    document.addEventListener('mousedown', clickHandler)

    return () => {
      document.removeEventListener('mousedown', clickHandler)
    }
  }, [])

  return [ref]
}
