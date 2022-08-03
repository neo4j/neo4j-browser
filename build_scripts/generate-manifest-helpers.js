/*
 * Copyright (c) 2002-2021 "Neo4j,"
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

function loadDataFromFile(file) {
  try {
    const obj = JSON.parse(fs.readFileSync(file, 'utf8'))
    return obj
  } catch (e) {
    throw new Error('Could not load or parse file: ' + file + '. Error: ' + e)
  }
}

function writeDataToFile(file, data) {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2))
  } catch (e) {
    throw new Error('Could not write to file: ' + file + '. Error: ' + e)
  }
}

function buildTargetObject(data, dataProp) {
  const out = {}
  const keys = data[dataProp] || []
  keys.forEach(key => (out[key] = data[key]))
  return out
}

module.exports = {
  loadDataFromFile,
  writeDataToFile,
  buildTargetObject
}
