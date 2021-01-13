import { useState, useEffect, useRef } from 'react'
import { isEmpty, indexOf, join, slice, without } from 'lodash-es'

import { AnyFunc, IScript, ScriptFolder, NewFolderPathGenerator } from './types'

import {
  getRootLevelFolder,
  getSubLevelFolders,
  sortAndGroupScriptsByPath
} from './saved-scripts.utils'

/**
 * Maintains a state of script folders, separated into root and sub folders
 * @param     {string}                            namespace
 * @param     {IScript[]}                         scripts
 * @return    {[ScriptFolder, ScriptFolder[]]}                root and sub folders
 */
export function useScriptsFolders(
  namespace: string,
  scripts: IScript[]
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
 * @param     {string}                                  name
 * @param     {AnyFunc}                                 onUpdate
 * @return    {[boolean, string, AnyFunc, AnyFunc]}
 */
export function useNameUpdate(
  name: string,
  onUpdate: AnyFunc
): [boolean, string, AnyFunc, AnyFunc] {
  const [inputValue, setNameInput] = useState(name)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (!isEditing && inputValue !== name) {
      onUpdate(inputValue)
    }
  }, [isEditing])

  return [isEditing, inputValue, setIsEditing, setNameInput]
}

/**
 * Maintains a state of empty folders
 * @param   {string}                                      namespace
 * @param   {NewFolderPathGenerator}                      pathGenerator
 * @param   {string[]}                                    allSavedFolderNames
 * @return  {[string[], AnyFunc, AnyFunc, AnyFunc]}
 */
export function useEmptyFolders(
  namespace: string,
  pathGenerator: NewFolderPathGenerator,
  allSavedFolderNames: string[]
): [string[], boolean, AnyFunc, AnyFunc, AnyFunc] {
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
 * @param     {AnyFunc}               onBlur
 * @return    {[MutableRefObject]}
 */
export function useCustomBlur(onBlur: AnyFunc) {
  const ref = useRef(null)
  const clickHandler = (event: Event) => {
    // i honestly dont know whats wrong with ts here
    // @ts-ignore
    if (ref.current && !ref.current.contains(event.target)) {
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
