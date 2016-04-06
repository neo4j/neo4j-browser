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
  $rootScope = {}

  beforeEach module 'neo4jApp.services'
  beforeEach inject (_SyncService_, _localStorageService_, _$rootScope_) ->
    SyncService = _SyncService_
    Storage = _localStorageService_
    $rootScope = _$rootScope_

  it 'should expose syncKeys', ->
    expect(JSON.stringify(SyncService.syncKeys)).toBe(JSON.stringify([{value:'documents', display:'favorites'}, {value:'folders', display:'folders'}, {value: 'grass', display:'grass'}]))

  it 'should update sync time when item "updated_at" is supplied and service has connection', ->
    timeBefore = SyncService.lastSyncedAt
    $rootScope.$digest()
    SyncService.authenticated = yes
    SyncService.hasConnection = yes
    SyncService.syncItem {key: 'updated_at'}
    $rootScope.$digest()
    timeAfter = SyncService.lastSyncedAt
    expect(timeBefore).not.toBe(timeAfter)

  it 'should not update sync time when item "updated_at" is supplied but service does not have connection', ->
    timeBefore = SyncService.lastSyncedAt
    $rootScope.$digest()
    SyncService.authenticated = yes
    SyncService.hasConnection = no
    SyncService.syncItem {key: 'updated_at'}
    $rootScope.$digest()
    timeAfter = SyncService.lastSyncedAt
    expect(timeBefore).toBe(timeAfter)

  it 'should have the state inSync = no when not authenticated and never signed in (ntn_data empty)', ->
    expect($rootScope.ntn_data).toBe undefined
    stateBefore = SyncService.inSync
    SyncService.syncItem({key: 'grass', newvalue: JSON.stringify({node: {diameter: '50px'}})})
    $rootScope.$digest()
    stateAfter = SyncService.inSync
    expect(stateBefore).toBeFalsy()
    expect(stateBefore).toBe(stateAfter)
    expect(SyncService.authenticated).toBeFalsy()
    expect($rootScope.ntn_data).toBe undefined

   # TODO: Separate 'updated_at' (for localstorage) and lastSyncedAt (for remote serverice)
   # Writing to localstorage != in sync with remote service. The test below shows this.
   # it 'should have the state inSync = no when not authenticated', ->
   #  expect($rootScope.ntn_data).toBe undefined
   #  $rootScope.ntn_data = {grass: 'x'} # Set to anything to fake that we once were signed in
   #  stateBefore = SyncService.inSync
   #  SyncService.syncItem({key: 'grass', newvalue: JSON.stringify({node: {diameter: '50px'}})})
   #  $rootScope.$digest()
   #  stateAfter = SyncService.inSync
   #  expect(stateBefore).toBeFalsy()
   #  expect(stateBefore).toEqual(stateAfter)
   #  expect(SyncService.authenticated).toBeFalsy()

  it 'should have the state inSync = yes when authenticated', ->
    expect($rootScope.ntn_data).toBe undefined
    $rootScope.$digest()
    $rootScope.ntn_data = {grass: 'x'} # Set $id to pretend we're connected to service
    $rootScope.$digest()
    SyncService.authenticated = yes # Fake authenticated
    stateBefore = SyncService.inSync
    $rootScope.$digest()
    SyncService.syncItem({key: 'grass', newvalue: JSON.stringify({node: {diameter: '50px'}})})
    $rootScope.$digest()
    stateAfter = SyncService.inSync
    expect(stateBefore).toBeFalsy()
    expect(stateBefore).not.toBe(stateAfter)
    expect(SyncService.authenticated).toBeTruthy()

  it 'should not call push for existing users', ->
    expect($rootScope.ntn_data).toBe undefined
    $rootScope.$digest()
    $rootScope.ntn_data = {$id: 1, documents: [{data: []}]} # Set $id to pretend we're connected to service and 'documents' = existing user
    SyncService.authenticated = yes # Fake authenticated
    stateBefore = SyncService.inSync
    spyOn(SyncService, 'push').and.returnValue(yes)
    $rootScope.$digest()
    SyncService.syncItem({key: 'grass', newvalue: JSON.stringify({node: {diameter: '50px'}})})
    $rootScope.$digest()
    stateAfter = SyncService.inSync
    expect(stateBefore).toBeFalsy()
    expect(stateBefore).not.toBe(stateAfter)
    expect(SyncService.authenticated).toBeTruthy()
    expect(SyncService.push).not.toHaveBeenCalled()

  it 'should call push for new users', ->
    expect($rootScope.ntn_data).toBe undefined
    $rootScope.$digest()
    $rootScope.ntn_data = {$id: 1} # Set $id to pretend we're connected to service, but no 'documents' = new user
    SyncService.authenticated = yes # Fake authenticated
    stateBefore = SyncService.inSync
    spyOn(SyncService, 'push').and.returnValue(yes)
    $rootScope.$digest()
    SyncService.syncItem({key: 'grass', newvalue: JSON.stringify({node: {diameter: '50px'}})})
    $rootScope.$digest()
    stateAfter = SyncService.inSync
    expect(stateBefore).toBeFalsy()
    expect(stateBefore).not.toBe(stateAfter)
    expect(SyncService.authenticated).toBeTruthy()
    expect(SyncService.push).toHaveBeenCalled()

  it 'should be able to restore documents to an older version', (done) ->
    docs = [
      {
        data: [{content: 'query1'}],
        syncedAt: 2000
      },{
        data: [{content: 'query2'}],
        syncedAt: 1000
      },
    ]
    $rootScope.ntn_data = {$id: 1, documents: docs}
    $rootScope.$digest()
    expect($rootScope.ntn_data.documents[0].syncedAt).toBe(2000)
    SyncService.restoreToVersion('documents', 1000, (err, res) ->
      expect(res).toBe(1)
      expect($rootScope.ntn_data.documents[0].syncedAt).toBeGreaterThan(2000) # Sync time gets renewed
      expect($rootScope.ntn_data.documents[0].data[0].content).toBe('query2')
      expect($rootScope.ntn_data.documents[1].syncedAt).toBe(2000)
      done()
    )
