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
import { Favorite } from 'shared/modules/favorites/favoritesDuck'
import { Script, ScriptFolder } from './types'

export function getScriptDisplayName(script: Favorite): string {
  const nameLine = script.content.split('\n')[0]
  return nameLine.startsWith('//') ? nameLine.substr(2).trimLeft() : nameLine
}

export function sortAndGroupScriptsByPath(
  namespace: string,
  scripts: Script[]
): ScriptFolder[] {
  const namespaceScripts = filter(scripts, ({ path }) =>
    startsWith(path, namespace)
  )

  return sortBy(
    entries(groupBy(namespaceScripts, ({ path }) => path)),
    ([path]) => path
  )
}

export function omitScriptPathPrefix(namespace: string, path: string): string {
  if (!isEmpty(path)) {
    return startsWith(path, namespace) ? path.slice(namespace.length) : path
  }

  return ''
}

export function addScriptPathPrefix(namespace: string, path: string): string {
  if (!isEmpty(path)) {
    return startsWith(path, namespace) ? path : `${namespace}${path}`
  }

  return namespace
}

/**
 *  Finds the root level folder returned from {@link sortAndGroupScriptsByPath}
 */
export function getRootLevelFolder(
  namespace: string,
  folders: ScriptFolder[]
): ScriptFolder {
  return find(folders, ([path]) => path === namespace) || [namespace, []]
}

/**
 *  Finds the sub level folders returned from {@link sortAndGroupScriptsByPath}
 */
export function getSubLevelFolders(
  namespace: string,
  folders: ScriptFolder[]
): ScriptFolder[] {
  return without(folders, getRootLevelFolder(namespace, folders))
}

export function getEmptyFolderDefaultPath(
  namespace: string,
  allFolderPaths: string[]
): string {
  const defaultPath = `${namespace}New Folder`

  if (!includes(allFolderPaths, defaultPath)) return defaultPath

  const numericalSuffixes = compact(
    map(allFolderPaths, path => {
      const numberEOL = path.match(/\d+$/)

      if (!numberEOL || !numberEOL[0]) return ''

      return parseInt(numberEOL[0])
    })
  )

  const highestSuffix = head(sortBy(numericalSuffixes, v => -v)) || 0

  return `${defaultPath} ${highestSuffix + 1}`
}
