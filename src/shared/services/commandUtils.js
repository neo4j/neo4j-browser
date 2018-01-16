/*
 * Copyright (c) 2002-2018 "Neo4j, Inc"
 * Network Engine for Objects in Lund AB [http://neotechnology.com]
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

export function cleanCommand (cmd) {
  const noComments = stripCommandComments(cmd)
  const noEmptyLines = stripEmptyCommandLines(noComments)
  return noEmptyLines
}

export function stripEmptyCommandLines (str) {
  const skipEmptyLines = e => !/^\s*$/.test(e)
  return str
    .split('\n')
    .filter(skipEmptyLines)
    .join('\n')
}

export function stripCommandComments (str) {
  return str.replace(/((^|\n)\/\/[^\n$]+\n?)/g, '')
}

export function splitStringOnFirst (str, delimiter) {
  const parts = str.split(delimiter)
  return [].concat(parts[0], parts.slice(1).join(delimiter))
}

export function splitStringOnLast (str, delimiter) {
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

export const getInterpreter = (interpret, cmd, cmdchar) => {
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
const prependUnderscore = str => '_' + str

export const transformCommandToHelpTopic = inputStr => {
  const res = [inputStr || '']
    .map(getHelpTopic)
    .map(lowerCase)
    .map(trim)
    .map(replaceSpaceWithDash)
    .map(snakeToCamel)
    .map(prependUnderscore)
  return res[0]
}
