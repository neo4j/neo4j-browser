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
  without,
  includes,
  compact,
  map,
  isEmpty
} from 'lodash-es'

import { IScript, ScriptFolder } from './types'

const COMMENT_PREFIX = '//'
/**
 * Gets the display name of a script
 * @param     {IScript}   script
 * @param     {string}    script.name         script name
 * @param     {string}    script.contents     script contents
 * @return    {string}                        script display name
 */
export function getScriptDisplayName({ name, contents }: IScript) {
  if (name) {
    return name
  }

  const lines = split(contents, '\n')
  const firstLine = trim(head(lines) || '')

  if (isEmpty(firstLine)) {
    return ''
  }

  return startsWith(firstLine, COMMENT_PREFIX)
    ? trim(firstLine.slice(COMMENT_PREFIX.length))
    : firstLine
}

/**
 * groups and sorts scripts by path
 * @param     {string}                  namespace
 * @param     {IScript[]}               scripts
 * @return    {ScriptFolder[]}                     sorted, grouped, scripts
 */
export function sortAndGroupScriptsByPath(
  namespace: string,
  scripts: IScript[]
): ScriptFolder[] {
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
 * @param     {string}    namespace
 * @param     {string}    path
 * @return    {string}
 */
export function omitScriptPathPrefix(namespace: string, path: string) {
  if (!isEmpty(path)) {
    return startsWith(path, namespace) ? path.slice(namespace.length) : path
  }

  return ''
}

/**
 * Adds script path prefix to path
 * @param     {string}    namespace
 * @param     {string}    path
 * @return    {string}
 */
export function addScriptPathPrefix(namespace: string, path: string) {
  if (!isEmpty(path)) {
    return startsWith(path, namespace) ? path : `${namespace}${path}`
  }

  return namespace
}

/**
 *  Finds the root level folder returned from {@link sortAndGroupScriptsByPath}
 * @param     {string}                    namespace
 * @param     {ScriptFolder[]}           folders     return of {@link sortAndGroupScriptsByPath}
 * @return    {ScriptFolder}                         root level script group
 */
export function getRootLevelFolder(namespace: string, folders: ScriptFolder[]) {
  return find(folders, ([path]) => path === namespace) || [namespace, []]
}

/**
 *  Finds the sub level folders returned from {@link sortAndGroupScriptsByPath}
 * @param     {string}                    namespace
 * @param     {ScriptFolder[]}           folders     return of {@link sortAndGroupScriptsByPath}
 * @return    {ScriptFolder[]}                       sub level script groups
 */
export function getSubLevelFolders(namespace: string, folders: ScriptFolder[]) {
  return without(folders, getRootLevelFolder(namespace, folders))
}

/**
 * Returns the default path for an empty folder
 * @param     {string}      namespace
 * @param     {string[]}    allFolderPaths
 * @return    {string}
 */
export function getEmptyFolderDefaultPath(
  namespace: string,
  allFolderPaths: string[]
) {
  const defaultPath = `${namespace}New Folder`

  if (!includes(allFolderPaths, defaultPath)) return defaultPath

  const numericalSuffixes = compact(
    map(allFolderPaths, path => {
      const numberEOL = path.match(/\d+$/)

      if (!numberEOL) return ''

      return parseInt(head(numberEOL)!)
    })
  )

  const highestSuffix = head(sortBy(numericalSuffixes, v => -v)) || 0

  return `${defaultPath} ${highestSuffix + 1}`
}
