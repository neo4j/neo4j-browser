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

const fs = require('fs')
const packageJson = './package.json'
const manifestJson = './src/browser/manifest-base.json'
const npmrc = './.npmrc'
const yarnrc = './.yarnrc'
const registry = 'https://registry.npmjs.org/'
const packageName = '@neo4j/neo4j-browser-canary'
const displayName = 'Neo4j Browser Canary'

function failExit(msg) {
  console.log('Error. ' + msg)
  process.exit(1)
}

function successExit() {
  console.log('Files updated successfully.\n')
  process.exit(0)
}

function changeJsonFileField(file, fields, vals) {
  if (
    !Array.isArray(fields) ||
    !Array.isArray(vals) ||
    fields.length !== vals.length
  ) {
    return failExit('Fields and vals need to be arrays')
  }
  const data = fs.readFileSync(file)
  try {
    const obj = JSON.parse(data)
    for (let i = 0; i < fields.length; i++) {
      obj[fields[i]] = vals[i]
    }
    fs.writeFileSync(file, JSON.stringify(obj, null, 2) + '\n')
  } catch (e) {
    return failExit('Failed writing to: ' + file + '. Message: ' + e.message)
  }
}

function setRegistries(registry) {
  const yarnContents = 'registry "' + registry + '"\n'
  const npmContents = 'registry=' + registry + '\n' + 'tag-version-prefix=""\n'
  try {
    fs.writeFileSync(yarnrc, yarnContents)
    fs.writeFileSync(npmrc, npmContents)
  } catch (e) {
    failExit('Could not set registry. ' + e.message)
  }
}

function main() {
  changeJsonFileField(packageJson, ['name'], [packageName])
  changeJsonFileField(
    manifestJson,
    ['name', 'short_name', 'icons'],
    [
      displayName,
      displayName,
      [
        {
          src: './assets/images/device-icons/neo4j-desktop-canary.svg',
          type: 'svg'
        }
      ]
    ]
  )
  setRegistries(registry)
  successExit()
}

main()
