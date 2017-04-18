/*
 * Copyright (c) 2002-2017 "Neo Technology,"
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
  return str.replace(/(^|\n)\s*/g, '')
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
  return [].concat(parts.slice(0, parts.length - 1).join(delimiter), parts[parts.length - 1])
}

export function extractCommandParameters (cmd, input) {
  const re = new RegExp('^[^\\w]*' + cmd + '\\s+(?:(?:`([^`]+)`)|([^:]+))\\s*(?:(?::\\s?([^$]*))?)$')
  const matches = re.exec(input)
  if (!matches) return false
  const name = matches[1] || matches[2]
  let val = matches[3]
  try {
    val = eval('(' + val + ')') // eslint-disable-line
    if (val === undefined) throw new Error('Parsing error')
  } catch (e) {
    return false
  }
  return {[name]: val}
}

export function parseCommandJSON (cmd, input) {
  const clean = input.substring(cmd.length).trim()
  if (!/^\{.*\}$/.test(clean)) return false
  let val = false
  try {
    val = eval('(' + clean + ')') // eslint-disable-line
    if (val === undefined) throw new Error('Parsing error')
  } catch (e) {
    return false
  }
  return val
}

export const isCypherCommand = (cmd, cmdchar) => {
  const cleanCmd = cleanCommand(cmd)
  return cleanCmd[0] !== cmdchar
}

export const getInterpreter = (interpret, cmd, cmdchar) => {
  if (isCypherCommand(cmd, cmdchar)) return interpret('cypher')
  return interpret(cmd.substr(cmdchar.length))
}

export const isNamedInterpreter = (interpreter) => interpreter && interpreter.name !== 'catch-all'
