/*
 * Copyright (c) "Neo4j"
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
import { extractStatements } from '@neo4j-cypher/extract-statements'

export function cleanCommand(cmd: string): string {
  const noComments = stripCommandComments(cmd)
  return stripEmptyCommandLines(noComments)
}

export function stripEmptyCommandLines(str: string): string {
  const skipEmptyLines = (e: string) => !/^\s*$/.test(e)
  return str.split('\n').filter(skipEmptyLines).join('\n')
}

export function stripCommandComments(str: string): string {
  return str
    .split('\n')
    .filter((line: string) => !line.trim().startsWith('//'))
    .join('\n')
}

export function splitStringOnFirst(
  str: string,
  delimiter: string | RegExp
): string[] {
  const parts = str.split(delimiter)
  const strWithoutFirst = str.slice(parts[0].length + 1)
  return ([] as string[]).concat(parts[0], strWithoutFirst)
}

export function splitStringOnLast(
  str: string,
  delimiter: string | RegExp
): string[] {
  const parts = str.split(delimiter)
  const lastPart = parts[parts.length - 1]
  const stringWithoutLast =
    parts.length > 1 ? str.slice(0, str.length - lastPart.length - 1) : ''
  return ([] as string[]).concat(stringWithoutLast, lastPart)
}

export const isCypherCommand = (cmd: string): boolean => {
  const cleanCmd = cleanCommand(cmd)
  return cleanCmd[0] !== ':'
}

export const buildCommandObject = (action: any, interpret: any) => {
  const interpreted = getInterpreter(interpret, action.cmd, action.ignore)
  return { action, interpreted, useDb: action.useDb }
}

export const getInterpreter = (interpret: any, cmd: string, ignore = false) => {
  if (ignore) return interpret('noop')
  if (isCypherCommand(cmd)) return interpret('cypher')
  return interpret(cleanCommand(cmd).substr(1))
}

export const extractPostConnectCommandsFromServerConfig = (
  str: string
): string[] | undefined => {
  const substituteStr = '@@semicolon@@'
  const substituteRe = new RegExp(substituteStr, 'g')
  const replaceFn = (m: string) => m.replace(/;/g, substituteStr)
  const qs = [/(`[^`]*?`)/g, /("[^"]*?")/g, /('[^']*?')/g]
  qs.forEach(q => (str = str.replace(q, replaceFn)))
  const splitted = str
    .split(';')
    .map((item: string) => item.trim())
    .map((item: string) => item.replace(substituteRe, ';'))
    .filter((item: string) => item && item.length)
  return splitted && splitted.length ? splitted : undefined
}

const getHelpTopic = (str: string) => splitStringOnFirst(str, ' ')[1] || 'help' // Map empty input to :help help
const stripPound = (str: string) => splitStringOnFirst(str, '#')[0]
const lowerCase = (str: string) => str.toLowerCase()
const trim = (str: string) => str.trim()
const replaceSpaceWithDash = (str: string) => str.replace(/\s/g, '-')
const snakeToCamel = (str: string) =>
  str.replace(/(-\w)/g, (match: string) => match[1].toUpperCase())
const camelToSnake = (name: string, separator: string) => {
  return name
    .replace(
      /([a-z]|(?:[A-Z0-9]+))([A-Z0-9]|$)/g,
      (_: string, $1: string, $2: string) =>
        $1 + ($2 && (separator || '_') + $2)
    )
    .toLowerCase()
}

export const transformCommandToHelpTopic = (inputStr?: string): string =>
  [inputStr || '']
    .map(stripPound)
    .map(getHelpTopic)
    .map(lowerCase)
    .map(trim)
    .map(replaceSpaceWithDash)
    .map(snakeToCamel)[0]

export const transformHelpTopicToCommand = (inputStr: string): string => {
  if (inputStr.indexOf('-') > -1) {
    return inputStr
  }
  return camelToSnake(inputStr, '-').replace('-', ' ')
}

const quotedRegex = /^"(.*)"|'(.*)'/
const arrowFunctionRegex = /^.*=>\s*([^$]*)$/

export const mapParamToCypherStatement = (key: any, param: any): string => {
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

export const extractStatementsFromString = (str: string) => {
  const cleanCmd = cleanCommand(str)
  const parsed = extractStatements(cleanCmd)
  const { statements } = parsed.referencesListener
  return statements[0]
    .raw()
    .map((stmt: any) => stmt.getText().trim())
    .filter((_: any) => _)
}

export const getCommandAndParam = (str: string): string[] => {
  const [serverCmd, props] = splitStringOnFirst(
    splitStringOnFirst(str, ' ')[1],
    ' '
  )
  return [serverCmd, props]
}
