###!
Copyright (c) 2002-2016 "Neo Technology,"
Network Engine for Objects in Lund AB [http://neotechnology.com]

This file is part of Neo4j.

Neo4j is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
###

'use strict'
if global? then global.neo = global.neo || {};
if window? then window.neo = window.neo || {};

neo = global?.neo || window?.neo

class neo.boltIntHelpers
  bolt = window.neo4j.v1
  stringify = (val) ->
    return val.toString() if bolt.isInt val
    return "[" + val.map((item) -> stringify(item)).join() + "]" if Array.isArray(val)
    return 'null' if val is null
    if typeof val == 'object'
      return "{" + Object.keys(val).map((key) ->  '"' + key + '"' + ":" + stringify(val[key])).join() + "}"
    return '"' + val + '"' if typeof val == 'string'
    return val.toString()


  mapBoltIntsToStrings = (val) ->
    return mapBoltInts(val, (boltInt) -> boltInt.toString())

  mapBoltIntsToInts = (val) ->
    return mapBoltInts(val, (boltInt) -> parseInt(boltInt.toString()))

  mapBoltInts = (val, mappingFunc) ->
    return mappingFunc val if bolt.isInt val
    return val.map((item) -> mapBoltInts(item, mappingFunc)) if Array.isArray(val)
    if typeof val == 'object' && val != null
      out = {}
      Object.keys(val).forEach((key) ->
        out[key] = mapBoltInts(val[key], mappingFunc))
      return out
    return val

  constructor: ->
    @stringify = stringify
    @mapBoltIntsToStrings = mapBoltIntsToStrings
    @mapBoltIntsToInts = mapBoltIntsToInts
