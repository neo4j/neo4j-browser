/*
 * Copyright (c) 2002-2019 "Neo4j,"
 * Neo4j Sweden AB [http://neo4j.com]
 * This file is part of Neo4j.
 * Neo4j is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

import { useState, useEffect, useRef } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import {
  filter,
  indexOf,
  join,
  map,
  slice,
  startsWith,
  without
} from 'lodash-es'

import {
  getRootLevelFolder,
  getSubLevelFolders,
  sortAndGroupScriptsByPath,
  getEmptyFolderDefaultPath
} from './my-scripts.utils'
import { arrayHasItems } from './generic.utils'

/**
 * Maintains a state of script folders, separated into root and sub folders
 * @param     {String}                                              namespace
 * @param     {Object[]}                                            scripts
 * @return    {[[String, Object[]] | null, [String, Object[]][]]}                   root and sub folders
 */
export function useScriptsFolders (namespace, scripts) {
  const [sortedScriptGroups, setSortedScriptGroups] = useState(
    sortAndGroupScriptsByPath(namespace, scripts)
  )

  useEffect(
    () => {
      setSortedScriptGroups(sortAndGroupScriptsByPath(namespace, scripts))
    },
    [scripts]
  )

  return [
    getRootLevelFolder(namespace, sortedScriptGroups),
    getSubLevelFolders(namespace, sortedScriptGroups)
  ]
}

/**
 * Maintains a state of a name and calls update action whenever user exits editing
 * @param     {String}                                  name
 * @param     {Function}                                onUpdate
 * @return    {[Boolean, String, Function, Function]}
 */
export function useNameUpdate (name, onUpdate) {
  const [inputValue, setNameInput] = useState(name)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(
    () => {
      if (!isEditing && inputValue !== name) {
        onUpdate(inputValue)
      }
    },
    [isEditing]
  )

  return [isEditing, inputValue, setIsEditing, setNameInput]
}

/**
 * Maintains a state of empty folders
 * @param   {String}                                      namespace
 * @param   {String}                                      allSavedFolderNames
 * @return  {[String[], Function, Function, Function]}
 */
export function useEmptyFolders (namespace, allSavedFolderNames) {
  const [emptyFolders, setEmptyFolders] = useState([])
  const canAddFolder = !arrayHasItems(emptyFolders)
  const defaultPath = getEmptyFolderDefaultPath(namespace)
  const addEmptyFolder = () => {
    const allUntitled = filter(allSavedFolderNames, name =>
      startsWith(name, defaultPath)
    )

    if (arrayHasItems(allUntitled)) {
      setEmptyFolders([...emptyFolders, `${defaultPath} ${allUntitled.length}`])
      return
    }

    setEmptyFolders([...emptyFolders, defaultPath])
  }
  const removeEmptyFolder = path => setEmptyFolders(without(emptyFolders, path))
  const updateEmptyFolder = (oldPath, newPath) => {
    const index = indexOf(emptyFolders, oldPath)

    setEmptyFolders([
      ...slice(emptyFolders, 0, index),
      newPath,
      ...slice(emptyFolders, index + 1)
    ])
  }

  useEffect(
    () => {
      setEmptyFolders(without(emptyFolders, ...allSavedFolderNames))
    },
    [join(allSavedFolderNames)]
  )

  return [
    emptyFolders,
    canAddFolder,
    addEmptyFolder,
    updateEmptyFolder,
    removeEmptyFolder
  ]
}

/**
 * Enables moving scripts using react-dnd
 * @param     {Object}                        script
 * @return    {[MutableRefObject]}
 */
export function useScriptDrag (script) {
  const ref = useRef(null)
  const [, drag] = useDrag({
    item: { type: script.path, id: script.id }
  })

  drag(ref)

  return [ref]
}

/**
 * Enables dropping scripts into folders
 * @param     {String}                        folderName
 * @param     {String[]}                      allFolderNames
 * @param     {Function}                      onUpdateFolder
 * @return    {[MutableRefObject, Boolean]}
 */
export function useFolderDrop (folderName, allFolderNames, onUpdateFolder) {
  const ref = useRef(null)
  const [, drop] = useDrop({
    accept: map(allFolderNames, name => name),
    drop (item) {
      onUpdateFolder([item], { path: folderName })
    }
  })

  drop(ref)

  return [ref]
}

/**
 * Fires an onBlur only when clicked outside ref
 * @param     {Function}              onBlur
 * @return    {[MutableRefObject]}
 */
export function useCustomBlur (onBlur) {
  const ref = useRef(null)
  const clickHandler = event => {
    if (ref.current && !ref.current.contains(event.target)) {
      onBlur()
    }
  }

  useEffect(() => {
    document.addEventListener('mousedown', clickHandler)
    return () => {
      document.removeEventListener('mousedown', clickHandler)
    }
  })

  return [ref]
}
