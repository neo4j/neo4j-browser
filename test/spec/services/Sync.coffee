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

describe 'Service: Sync', () ->
  SyncService = {}
  Storage = {}
  $rScope = {}

  beforeEach module 'neo4jApp.services'
  beforeEach inject (_SyncService_, _localStorageService_, $rootScope) ->
    SyncService = _SyncService_
    Storage = _localStorageService_
    $rScope = $rootScope.$new()

    spyOn(Storage, 'get').andCallFake((key) -> [{content: 'hej'}])

  it 'should expose syncKeys', ->
    expect(JSON.stringify(SyncService.syncKeys)).toBe(JSON.stringify(['documents', 'folders', 'grass']))
   
  it 'should get the current data in local storage for syncKeys', ->
    #res = SyncService.
