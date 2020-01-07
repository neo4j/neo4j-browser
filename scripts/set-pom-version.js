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
const path = require('path')
const xml2js = require('xml2js')
const parser = new xml2js.Parser()
const builder = new xml2js.Builder()

// Shallow validation
if (process.argv.length !== 6) failExit()

// Create obj from args
const args = parseArgv(process.argv)
main(args)

function main(args) {
  if (!args['-f'] || !args['-v']) return failExit() // Validate args

  const file = path.join(__dirname, '../', args['-f'])

  fs.readFile(file, function(err, data) {
    if (err) return failExit()
    parser.parseString(data, function(err, result) {
      if (err) return failExit()
      result.project.version = args['-v'] // Set new version in obj
      const xml = builder.buildObject(result) // Create XML
      fs.writeFile(file, xml, function(err) {
        if (err) return failExit()
        console.log('\nDone updating version in pom.xml\n')
        process.exit(0) // All good
      })
    })
  })
}

function parseArgv(argv) {
  const out = {}
  for (let i = 0; i < argv.length; i += 2) {
    // Pairs
    out[argv[i]] = argv[i + 1]
  }
  return out
}

function failExit() {
  console.log(
    'Error. Usage: "node set-pom-version.js -f filepath/from/project/root/pom.xml -v new-version-semver"'
  )
  process.exit(1)
}
