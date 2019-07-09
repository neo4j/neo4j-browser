/*
 * Copyright (c) 2002-2019 "Neo4j,"
 * Neo4j Sweden AB [http://neo4j.com]
 *
 * This file is part of Neo4j.
 *
 * Neo4j is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import {
  filter,
  find,
  split,
  head,
  trim,
  startsWith,
  sortBy,
  entries,
  groupBy,
  without
} from 'lodash-es'

import { COMMENT_PREFIX, NEW_LINE } from './my-scripts.constants'
import { isNonEmptyString } from './generic.utils'

/**
 * Converts theme style props to react style props for header
 * @param     {Object}    props
 * @param     {Object}    props.theme   application theme props
 * @return    {Object}                  react style props
 */
export function getHeaderStyleFromTheme ({ theme }) {
  return {
    color: theme.primaryHeaderText,
    fontFamily: theme.drawerHeaderFontFamily
  }
}

/**
 * Converts theme style props to react style props for sub header
 * @param     {Object}    props
 * @param     {Object}    props.theme   application theme props
 * @return    {Object}                  react style props
 */
export function getScriptDisplayNameStyleFromTheme ({ theme }) {
  return {
    fontFamily: theme.primaryFontFamily
  }
}

/**
 * Gets the display name of a script
 * @param     {Object}    script
 * @param     {String}    script.name         script name
 * @param     {String}    script.contents     script contents
 * @return    {String}                        script display name
 */
export function getScriptDisplayName ({ name, contents }) {
  if (name) {
    return name
  }

  const lines = split(contents, NEW_LINE)
  const firstLine = trim(head(lines) || '')

  if (!isNonEmptyString(firstLine)) {
    return ''
  }

  return startsWith(firstLine, COMMENT_PREFIX)
    ? firstLine.slice(COMMENT_PREFIX.length)
    : firstLine
}

/**
 * groups and sorts scripts by path
 * @param     {String}                  namespace
 * @param     {Object[]}                scripts
 * @return    {[String, Object[]][]}                  sorted, grouped, scripts
 */
export function sortAndGroupScriptsByPath (namespace, scripts) {
  const namespaceScripts = filter(scripts, ({ path }) =>
    startsWith(path, namespace)
  )

  return sortBy(
    entries(groupBy(namespaceScripts, ({ path }) => path)),
    ([path]) => path
  )
}

/**
 * Omits script path prefix from path
 * @param     {String}    namespace
 * @param     {String}    path
 * @return    {String}
 */
export function omitScriptPathPrefix (namespace, path) {
  if (isNonEmptyString(path)) {
    return startsWith(path, namespace) ? path.slice(namespace.length) : path
  }

  return ''
}

/**
 * Adds script path prefix to path
 * @param     {String}    namespace
 * @param     {String}    path
 * @return    {String}
 */
export function addScriptPathPrefix (namespace, path) {
  if (isNonEmptyString(path)) {
    return startsWith(path, namespace) ? path : `${namespace}${path}`
  }

  return namespace
}

/**
 *  Finds the root level folder returned from {@link sortAndGroupScriptsByPath}
 * @param     {String}                    namespace
 * @param     {[String, Object[]][]}      folders     return of {@link sortAndGroupScriptsByPath}
 * @return    {[String, Object[]]}                    root level script group
 */
export function getRootLevelFolder (namespace, folders) {
  return find(folders, ([path]) => path === namespace) || [namespace, []]
}

/**
 *  Finds the sub level folders returned from {@link sortAndGroupScriptsByPath}
 * @param     {String}                    namespace
 * @param     {[String, Object[]][]}      folders     return of {@link sortAndGroupScriptsByPath}
 * @return    {[String, Object[]][]}                  sub level script groups
 */
export function getSubLevelFolders (namespace, folders) {
  return without(folders, getRootLevelFolder(namespace, folders))
}

export function getEmptyFolderDefaultPath (namespace) {
  return `${namespace}New folder`
}
