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

describe 'BoltIntHelpers', () ->
  # load the service's module
  beforeEach module 'neo.boltint'
  bolt = window.neo4j.v1

# instantiate service
  BoltIntHelpers = {}
  beforeEach ->
    inject (_BoltIntHelpers_) ->
      BoltIntHelpers = _BoltIntHelpers_

  describe "stringify", ->
    it 'should turn big numbers into unquoted strings', ->
      expect(BoltIntHelpers.stringify(bolt.int("922337203685477580"))).toBe '922337203685477580'

    it 'should turn objects into strings with quoted keys', ->
      obj = {a:1, anotherKey:2}
      expect(BoltIntHelpers.stringify(obj)).toBe '{"a":1,"anotherKey":2}'

    it 'should turn objects into strings with big numbers as unquoted values', ->
      obj = {a:bolt.int("1"), anotherKey:2}
      expect(BoltIntHelpers.stringify(obj)).toBe '{"a":1,"anotherKey":2}'

    it 'should turn objects into strings with strings as quoted values', ->
      obj = {a:bolt.int("1"), anotherKey:2, stringKey: "hello"}
      expect(BoltIntHelpers.stringify(obj)).toBe '{"a":1,"anotherKey":2,"stringKey":"hello"}'

    it 'should turn arrays into strings', ->
      arr = [bolt.int("1"),2, "hello", true]
      expect(BoltIntHelpers.stringify(arr)).toBe '[1,2,"hello",true]'

    it 'should handle nested objects', ->
      arr = [bolt.int("9999"), {b: bolt.int("43243242423434324")}]
      obj = {a:bolt.int("1"), arrayKey: arr, anotherKey: null}
      expect(BoltIntHelpers.stringify(obj)).toBe '{"a":1,"arrayKey":[9999,{"b":43243242423434324}],"anotherKey":null}'

  describe 'mapBoltIntegersToStrings', ->

    it 'should map bolt integers to strings', ->
      expect(BoltIntHelpers.mapBoltIntsToStrings(bolt.int("922337203685477580"))).toBe '922337203685477580'

    it 'should map all bolt integers to strings in nested obejcts', ->
      arr = [bolt.int("9999"), {b: bolt.int("43243242423434324")}]
      obj = {a:bolt.int("1"), arrayKey: arr}

      mappedObj = BoltIntHelpers.mapBoltIntsToStrings(obj)
      expect(mappedObj.a).toBe('1')
      expect(mappedObj.arrayKey[0]).toBe('9999')
      expect(mappedObj.arrayKey[1].b).toBe('43243242423434324')

    it 'should return null if obejct is null', ->
      expect(BoltIntHelpers.mapBoltIntsToStrings(null)).toBe null

  describe 'mapBoltIntegersToInts', ->

    it 'should map bolt integers to plain integers', ->
      expect(BoltIntHelpers.mapBoltIntsToInts(bolt.int("922337203685477580"))).toBe 922337203685477600

    it 'should map all bolt integers to integers in nested obejcts', ->
      arr = [bolt.int("9999"), {b: bolt.int("43243242423434324")}]
      obj = {a:bolt.int("1"), arrayKey: arr}

      mappedObj = BoltIntHelpers.mapBoltIntsToInts(obj)
      expect(mappedObj.a).toBe(1)
      expect(mappedObj.arrayKey[0]).toBe(9999)
      expect(mappedObj.arrayKey[1].b).toBe(43243242423434324)

    it 'should return null if obejct is null', ->
      expect(BoltIntHelpers.mapBoltIntsToInts(null)).toBe null








