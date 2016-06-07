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

describe 'Utils', () ->
  # load the service's module
  beforeEach module 'neo.bignumber'


# instantiate service
  BigNumberHelpers = {}
  beforeEach ->
    inject (_BigNumberHelpers_) ->
      BigNumberHelpers = _BigNumberHelpers_

  describe "stringify", ->
    it 'should turn big numbers into unquoted strings', ->
      expect(BigNumberHelpers.stringify(new BigNumber("922337203685477580"))).toBe '922337203685477580'

    it 'should turn objects into strings with quoted keys', ->
      obj = {a:1, anotherKey:2}
      expect(BigNumberHelpers.stringify(obj)).toBe '{"a":1,"anotherKey":2}'

    it 'should turn objects into strings with big numbers as unquoted values', ->
      obj = {a:new BigNumber("1"), anotherKey:2}
      expect(BigNumberHelpers.stringify(obj)).toBe '{"a":1,"anotherKey":2}'

    it 'should turn objects into strings with strings as quoted values', ->
      obj = {a:new BigNumber("1"), anotherKey:2, stringKey: "hello"}
      expect(BigNumberHelpers.stringify(obj)).toBe '{"a":1,"anotherKey":2,"stringKey":"hello"}'

    it 'should turn arrays into strings', ->
      arr = [new BigNumber("1"),2, "hello", true]
      expect(BigNumberHelpers.stringify(arr)).toBe '[1,2,"hello",true]'

    it 'should handle nested objects', ->
      arr = [new BigNumber("9999"), {b: new BigNumber("43243242423434324")}]
      obj = {a:new BigNumber("1"), arrayKey: arr}
      expect(BigNumberHelpers.stringify(obj)).toBe '{"a":1,"arrayKey":[9999,{"b":43243242423434324}]}'

  describe 'mapBigIntegersToStrings', ->

    it 'should map big integers to strings', ->
      expect(BigNumberHelpers.mapBigIntsToStrings(new BigNumber("922337203685477580"))).toBe '922337203685477580'

    it 'should map all big integers to strings in nested obejcts', ->
      arr = [new BigNumber("9999"), {b: new BigNumber("43243242423434324")}]
      obj = {a:new BigNumber("1"), arrayKey: arr}

      mappedObj = BigNumberHelpers.mapBigIntsToStrings(obj)
      expect(mappedObj.a).toBe('1')
      expect(mappedObj.arrayKey[0]).toBe('9999')
      expect(mappedObj.arrayKey[1].b).toBe('43243242423434324')






