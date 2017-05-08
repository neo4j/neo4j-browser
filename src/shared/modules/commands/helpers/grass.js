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

export function parseGrass (string) {
  var result
  try {
    result = JSON.parse(string)
  } catch (e) {
    result = parseGrassCSS(string)
  }
  return result
}

function parseGrassCSS (string) {
  var chars = string.split('')
  var insideString = false
  var insideProps = false
  var insideBinding = false
  var keyword = ''
  var props = ''
  var rules = {}
  var i, j

  for (i = 0; i < chars.length; i++) {
    let c = chars[i]
    let skipThis = true
    switch (c) {
      case '{':
        if (insideString) {
          skipThis = false
        } else if (insideProps) {
          insideBinding = true
        } else {
          insideProps = true
        }
        break
      case '}':
        if (insideString) {
          skipThis = false
        } else if (insideBinding) {
          insideBinding = false
        } else {
          insideProps = false
          rules[keyword] = props
          keyword = ''
          props = ''
        }
        break
      case "'":
      case '"':
        insideString = !insideString
        break
      default:
        skipThis = false
        break
    }

    if (skipThis) {
      continue
    }

    if (insideProps) {
      props += c
    } else if (!c.match(/[\s\n]/)) {
      keyword += c
    }
  }

  const keys = Object.keys(rules)
  for (i = 0; i < keys.length; i++) {
    let val = rules[keys[i]]
    rules[keys[i]] = {}
    let props = val.split(';')
    for (j = 0; j < props.length; j++) {
      let propKeyVal = props[j].split(':')
      if (propKeyVal && propKeyVal.length === 2) {
        let prop = propKeyVal[0].trim()
        let value = propKeyVal[1].trim()
        rules[keys[i]][prop] = value
      }
    }
  }

  return rules
}
