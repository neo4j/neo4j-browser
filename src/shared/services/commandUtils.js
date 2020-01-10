/*
 * Copyright (c) 2002-2020 "Neo4j,"
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
import { includes, last, split, startsWith } from 'lodash-es'
import { extractStatements } from 'cypher-codemirror'

export function cleanCommand(cmd) {
  const noComments = stripCommandComments(cmd)
  const noEmptyLines = stripEmptyCommandLines(noComments)
  return noEmptyLines
}

export function stripEmptyCommandLines(str) {
  const skipEmptyLines = e => !/^\s*$/.test(e)
  return str
    .split('\n')
    .filter(skipEmptyLines)
    .join('\n')
}

export function stripCommandComments(str) {
  return str.replace(/((^|\n)\/\/[^\n$]+\n?)/g, '')
}

export function splitStringOnFirst(str, delimiter) {
  const parts = str.split(delimiter)
  return [].concat(parts[0], parts.slice(1).join(delimiter))
}

export function splitStringOnLast(str, delimiter) {
  const parts = str.split(delimiter)
  return [].concat(
    parts.slice(0, parts.length - 1).join(delimiter),
    parts[parts.length - 1]
  )
}

export const isCypherCommand = (cmd, cmdchar) => {
  const cleanCmd = cleanCommand(cmd)
  return cleanCmd[0] !== cmdchar
}

export const buildCommandObject = (action, interpret, cmdchar) => {
  const interpreted = getInterpreter(
    interpret,
    action.cmd,
    cmdchar,
    action.ignore
  )
  return { action, interpreted, cmdchar }
}

export const getInterpreter = (interpret, cmd, cmdchar, ignore = false) => {
  if (ignore) return interpret('noop')
  if (isCypherCommand(cmd, cmdchar)) return interpret('cypher')
  return interpret(cleanCommand(cmd).substr(cmdchar.length))
}

export const isNamedInterpreter = interpreter =>
  interpreter && interpreter.name !== 'catch-all'

export const extractPostConnectCommandsFromServerConfig = str => {
  const substituteStr = '@@semicolon@@'
  const substituteRe = new RegExp(substituteStr, 'g')
  const replaceFn = m => m.replace(/;/g, substituteStr)
  const qs = [/(`[^`]*?`)/g, /("[^"]*?")/g, /('[^']*?')/g]
  qs.forEach(q => (str = str.replace(q, replaceFn)))
  const splitted = str
    .split(';')
    .map(item => item.trim())
    .map(item => item.replace(substituteRe, ';'))
    .filter(item => item && item.length)
  return splitted && splitted.length ? splitted : undefined
}

const getHelpTopic = str => splitStringOnFirst(str, ' ')[1] || 'help' // Map empty input to :help help
const lowerCase = str => str.toLowerCase()
const trim = str => str.trim()
const replaceSpaceWithDash = str => str.replace(/\s/g, '-')
const snakeToCamel = str =>
  str.replace(/(-\w)/g, match => match[1].toUpperCase())
const camelToSnake = (name, separator) => {
  return name
    .replace(/([a-z]|(?:[A-Z0-9]+))([A-Z0-9]|$)/g, function(_, $1, $2) {
      return $1 + ($2 && (separator || '_') + $2)
    })
    .toLowerCase()
}

export const transformCommandToHelpTopic = inputStr =>
  [inputStr || '']
    .map(getHelpTopic)
    .map(lowerCase)
    .map(trim)
    .map(replaceSpaceWithDash)
    .map(snakeToCamel)[0]

export const transformHelpTopicToCommand = inputStr => {
  if (inputStr.indexOf('-') > -1) {
    return inputStr
  }
  return camelToSnake(inputStr, '-').replace('-', ' ')
}

const quotedRegex = /^"(.*)"|'(.*)'/
const arrowFunctionRegex = /^.*=>\s*([^$]*)$/

export const mapParamToCypherStatement = (key, param) => {
  const quotedKey = key.match(quotedRegex)
  const cleanKey = quotedKey
    ? '`' + quotedKey[1] + '`'
    : typeof key !== 'string'
    ? '`' + key + '`'
    : key
  const returnAs = value => `RETURN ${value} as ${cleanKey}`

  const matchParamFunction = param.toString().match(arrowFunctionRegex)
  if (matchParamFunction) {
    return returnAs(matchParamFunction[1])
  }
  return returnAs(param)
}

export const extractStatementsFromString = str => {
  const parsed = extractStatements(str)
  const { statements } = parsed.referencesListener
  return statements[0]
    .raw()
    .map(stmt => stmt.getText().trim())
    .filter(_ => _)
}

export const getCommandAndParam = str => {
  const [serverCmd, props] = splitStringOnFirst(
    splitStringOnFirst(str, ' ')[1],
    ' '
  )
  return [serverCmd, props]
}

export function tryGetRemoteInitialSlideFromUrl(url) {
  const hashBang = includes(url, '#') ? last(split(url, '#')) : ''

  if (!startsWith(hashBang, 'slide-')) return 0

  const slideIndex = Number(last(split(hashBang, 'slide-')))

  return !isNaN(slideIndex) ? slideIndex : 0
}
