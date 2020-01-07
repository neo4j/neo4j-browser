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
const ncp = require('ncp').ncp

function mkPath(dirPath) {
  if (!fs.existsSync(dirPath)) {
    try {
      fs.mkdirSync(dirPath)
    } catch (e) {
      mkPath(path.dirname(dirPath))
      mkPath(dirPath)
    }
  }
}

mkPath(path.join(__dirname, '../mvn'))
ncp(path.join(__dirname, '../dist'), path.join(__dirname, '../mvn/browser'))
ncp(
  path.join(__dirname, '../LICENSE'),
  path.join(__dirname, '../mvn/browser/LICENSE')
)
ncp(
  path.join(__dirname, '../LICENSES.txt'),
  path.join(__dirname, '../mvn/browser/LICENSES.txt')
)
ncp(
  path.join(__dirname, '../NOTICE.txt'),
  path.join(__dirname, '../mvn/browser/NOTICE.txt')
)
