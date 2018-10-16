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

const Cls = (neo.models.Relationship = class Relationship {
  static initClass () {
    this.prototype.isNode = false
    this.prototype.isRelationship = true
  }
  constructor (id, source, target, type, properties) {
    this.id = id
    this.source = source
    this.target = target
    this.type = type
    this.propertyMap = properties
    this.propertyList = (() => {
      const result = []
      for (let key of Object.keys(this.propertyMap || {})) {
        const value = this.propertyMap[key]
        result.push({ key, value })
      }
      return result
    })()
  }

  toJSON () {
    return this.propertyMap
  }
  isLoop () {
    return this.source === this.target
  }
})
Cls.initClass()
