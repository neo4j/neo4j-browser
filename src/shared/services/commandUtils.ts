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
import { extractStatements } from 'cypher-editor-support'

export function cleanCommand(cmd: any) {
  const noComments = stripCommandComments(cmd)
  const noEmptyLines = stripEmptyCommandLines(noComments)
  return noEmptyLines
}

export function stripEmptyCommandLines(str: any) {
  const skipEmptyLines = (e: any) => !/^\s*$/.test(e)
  return str
    .split('\n')
    .filter(skipEmptyLines)
    .join('\n')
}

export function stripCommandComments(str: any) {
  return str
    .split('\n')
    .filter((line: any) => !line.trim().startsWith('//'))
    .join('\n')
}

export function splitStringOnFirst(str: any, delimiter: any) {
  const parts = str.split(delimiter)
  return ([] as any[]).concat(parts[0], parts.slice(1).join(delimiter))
}

export function splitStringOnLast(str: any, delimiter: any) {
  const parts = str.split(delimiter)
  return [].concat(
    parts.slice(0, parts.length - 1).join(delimiter),
    parts[parts.length - 1]
  )
}

export const isCypherCommand = (cmd: any) => {
  const cleanCmd = cleanCommand(cmd)
  return cleanCmd[0] !== ':'
}

export const buildCommandObject = (action: any, interpret: any) => {
  const interpreted = getInterpreter(interpret, action.cmd, action.ignore)
  return { action, interpreted, useDb: action.useDb }
}

export const getInterpreter = (interpret: any, cmd: any, ignore = false) => {
  if (ignore) return interpret('noop')
  if (isCypherCommand(cmd)) return interpret('cypher')
  return interpret(cleanCommand(cmd).substr(1))
}

export const isNamedInterpreter = (interpreter: any) =>
  interpreter && interpreter.name !== 'catch-all'

export const extractPostConnectCommandsFromServerConfig = (str: any) => {
  const substituteStr = '@@semicolon@@'
  const substituteRe = new RegExp(substituteStr, 'g')
  const replaceFn = (m: any) => m.replace(/;/g, substituteStr)
  const qs = [/(`[^`]*?`)/g, /("[^"]*?")/g, /('[^']*?')/g]
  qs.forEach(q => (str = str.replace(q, replaceFn)))
  const splitted = str
    .split(';')
    .map((item: any) => item.trim())
    .map((item: any) => item.replace(substituteRe, ';'))
    .filter((item: any) => item && item.length)
  return splitted && splitted.length ? splitted : undefined
}

const getHelpTopic = (str: any) => splitStringOnFirst(str, ' ')[1] || 'help' // Map empty input to :help help
const stripPound = (str: any) => splitStringOnFirst(str, '#')[0]
const lowerCase = (str: any) => str.toLowerCase()
const trim = (str: any) => str.trim()
const replaceSpaceWithDash = (str: any) => str.replace(/\s/g, '-')
const snakeToCamel = (str: any) =>
  str.replace(/(-\w)/g, (match: any) => match[1].toUpperCase())
const camelToSnake = (name: any, separator: any) => {
  return name
    .replace(
      /([a-z]|(?:[A-Z0-9]+))([A-Z0-9]|$)/g,
      (_: any, $1: any, $2: any) => $1 + ($2 && (separator || '_') + $2)
    )
    .toLowerCase()
}

export const transformCommandToHelpTopic = (inputStr: any) =>
  [inputStr || '']
    .map(stripPound)
    .map(getHelpTopic)
    .map(lowerCase)
    .map(trim)
    .map(replaceSpaceWithDash)
    .map(snakeToCamel)[0]

export const transformHelpTopicToCommand = (inputStr: any) => {
  if (inputStr.indexOf('-') > -1) {
    return inputStr
  }
  return camelToSnake(inputStr, '-').replace('-', ' ')
}

const quotedRegex = /^"(.*)"|'(.*)'/
const arrowFunctionRegex = /^.*=>\s*([^$]*)$/

export const mapParamToCypherStatement = (key: any, param: any) => {
  const quotedKey = key.match(quotedRegex)
  const cleanKey = quotedKey
    ? `\`${quotedKey[1]}\``
    : typeof key !== 'string'
    ? `\`${key}\``
    : key
  const returnAs = (value: any) => `RETURN ${value} as ${cleanKey}`

  const matchParamFunction = param.toString().match(arrowFunctionRegex)
  if (matchParamFunction) {
    return returnAs(matchParamFunction[1])
  }
  return returnAs(param)
}

export const extractStatementsFromString = (str: any) => {
  const cleanCmd = cleanCommand(str)
  const parsed = extractStatements(cleanCmd)
  const { statements } = parsed.referencesListener
  return statements[0]
    .raw()
    .map((stmt: any) => stmt.getText().trim())
    .filter((_: any) => _)
}

export const getCommandAndParam = (str: any) => {
  const [serverCmd, props] = splitStringOnFirst(
    splitStringOnFirst(str, ' ')[1],
    ' '
  )
  return [serverCmd, props]
}

export function tryGetRemoteInitialSlideFromUrl(url: any) {
  const hashBang = includes(url, '#') ? last(split(url, '#')) : ''

  if (!startsWith(hashBang, 'slide-')) return 0

  const slideIndex = Number(last(split(hashBang, 'slide-')))

  return !isNaN(slideIndex) ? slideIndex : 0
}
