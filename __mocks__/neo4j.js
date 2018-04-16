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

function integerFn (val) {
  this.val = val
}
integerFn.prototype.toString = function () {
  return this.val.toString()
}

var out = {
  v1: {
    isInt: function (val) {
      return val instanceof out.v1.Integer
    },
    types: {
      Node: function Node (id, labels, properties) {
        this.identity = id
        this.labels = labels
        this.properties = properties
      },
      Relationship: function Relationship (id, start, end, type, properties) {
        this.identity = id
        this.start = start
        this.end = end
        this.type = type
        this.properties = properties
      },
      Path: function Path (start, end, segments) {
        this.start = start
        this.end = end
        this.segments = segments
        this.length = segments.length
      },
      PathSegment: function PathSegment (start, relationship, end) {
        this.start = start
        this.relationship = relationship
        this.end = end
      },
      Point: function Point (srid, x, y, z) {
        this.srid = srid
        this.x = x
        this.y = y
        this.z = z
      },
      Date: function Date (year, month, day) {
        this.year = year
        this.month = month
        this.day = day
      },
      DateTime: function DateTime (
        year,
        month,
        day,
        hour,
        minute,
        second,
        nanosecond,
        timeZoneOffsetSeconds,
        timeZoneId
      ) {
        this.year = year
        this.month = month
        this.day = day
        this.hour = hour
        this.minute = minute
        this.second = second
        this.nanosecond = nanosecond
        this.timeZoneOffsetSeconds = timeZoneOffsetSeconds
        this.timeZoneId = timeZoneId
      }
    },
    Integer: function Integer (low, high) {
      this.low = low
      this.high = high
    }
  }
}

out.v1.types.Node.prototype.toString = function () {
  return 'node'
}
out.v1.types.Relationship.prototype.toString = function () {
  return 'rel'
}
out.v1.types.Path.prototype.toString = function () {
  return 'path'
}
out.v1.types.PathSegment.prototype.toString = function () {
  return 'pathsegment'
}
out.v1.types.Point.prototype.toString = function () {
  return 'point'
}
out.v1.types.Date.prototype.toString = function () {
  return 'date'
}
out.v1.types.DateTime.prototype.toString = function () {
  return 'datetime'
}
out.v1.Integer.prototype.toInt = function () {
  return this.low
}
out.v1.Integer.prototype.toString = function () {
  return this.low
}
out.v1.Int = out.v1.Integer
out.v1.int = val => {
  if (val /* is compatible */ instanceof out.v1.Integer) return val
  if (typeof val === 'number') return new out.v1.Integer(val)
  if (typeof val === 'string') return new out.v1.Integer(val)
  // Throws for non-objects, converts non-instanceof Integer:
  return new out.v1.Integer(val.low, val.high)
}

module.exports = out
