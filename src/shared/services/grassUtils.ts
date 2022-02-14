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
export function parseGrass(string: any) {
  let result
  try {
    result = JSON.parse(string)
  } catch (e) {
    result = parseGrassCSS(string)
  }
  return result
}

function parseGrassCSS(string: any) {
  const chars = string.split('')
  let insideString = false
  let insideProps = false
  let insideBinding = false
  let keyword = ''
  let props = ''
  const rules: any = {}
  let i, j

  for (i = 0; i < chars.length; i++) {
    const c = chars[i]
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
    const val = rules[keys[i]]
    rules[keys[i]] = {}
    const props = val.split(';')
    for (j = 0; j < props.length; j++) {
      const propKeyVal = props[j].split(':')
      if (propKeyVal && propKeyVal.length === 2) {
        const prop = propKeyVal[0].trim()
        const value = propKeyVal[1].trim()
        rules[keys[i]][prop] = value
      }
    }
  }

  return rules
}

export const objToCss = (obj?: any) => {
  if (typeof obj !== 'object') {
    return false
  }
  let output = ''
  try {
    const level = '  '
    for (const selector in obj) {
      if (obj.hasOwnProperty(selector)) {
        output += `${selector} {\n${level}`
        for (const style in obj[selector]) {
          if (obj[selector].hasOwnProperty(style)) {
            output += `${style}: ${quoteSpecialStyles(
              style,
              obj[selector][style]
            )};\n${level}`
          }
        }
        output = `${output.trim()}\n`
        output += '}\n'
      }
    }
  } catch (e) {
    return false
  }
  return output
}

const shouldQuoteStyle = (style: any) =>
  ['defaultCaption', 'caption'].includes(style)
const quoteSpecialStyles = (style: any, value: any) =>
  (shouldQuoteStyle(style) ? '"' : '') +
  value +
  (shouldQuoteStyle(style) ? '"' : '')
