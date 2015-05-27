###!
Copyright (c) 2002-2014 "Neo Technology,"
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

'use strict';

angular.module('neo4jApp.services')
.service 'SyncService', [
  'localStorageService',
  'NTN'
  'CurrentUser'
  'Utils'
  'DefaultContentService'
  '$q'
  '$rootScope'
  (localStorageService, NTN, CurrentUser, Utils, DefaultContentService, $q, $rootScope) ->

    syncKeys = ['documents', 'folders', 'grass']
    setStorageJSON = (response) ->
      for key in syncKeys
        if typeof response[key] is 'undefined'
          localStorageService.remove key
          continue
        setStorageForKey key, response[key]
      # Trigger localstorage event for updated_at last, since that is used
      # to set inSync to true
      setStorageForKey 'updated_at', 1
      response

    setStorageForKey = (key, val) ->
      localStorageService.set key, val

    getStorage = ->
      d = {}
      d.documents = localStorageService.get 'documents'
      d.folders = localStorageService.get 'folders'
      d.stores = localStorageService.get 'stores'
      d.grass = JSON.stringify localStorageService.get('grass') || ''
      d

    $rootScope.$watch 'ntn_data', (ntn_data) ->
      return unless ntn_data
      if ntn_data.$id and typeof ntn_data.documents is 'undefined' #New user
        syncService.push()
      else
        forStorage = {}
        syncKeys.forEach((key) ->
          forStorage[key] = if Array.isArray(ntn_data[key]) then ntn_data[key][0].data else ntn_data[key]
        )
        setStorageJSON forStorage

    class SyncService
      constructor: ->
        $rootScope.$on 'LocalStorageModule.notification.setitem', (evt, item) =>
          @syncItem item

        $rootScope.$on 'ntn:authenticated', (evt, authenticated) =>
          @authenticated = authenticated
          @currentFavs = Utils.removeDocumentsFromArray(DefaultContentService.getDefaultDocuments(), getStorage().documents)
          @fetch() if authenticated

        $rootScope.$on 'ntn:data_loaded', (evt, didLoad) =>
          return unless didLoad is yes
          return unless @currentFavs.length > 0
          newFavs = Utils.mergeDocumentArrays($rootScope.ntn_data.documents[0].data, @currentFavs)
          return if $rootScope.ntn_data.documents[0].data.length is newFavs.length
          setStorageForKey 'documents', newFavs

      syncItem: (item) -> 
        return @setSyncedAt() if item.key is 'updated_at'
        return unless item.key in syncKeys
        newvalue = if item.key is 'grass' then item.newvalue else JSON.parse item.newvalue
        newvalue = @getObjectStruct newvalue
        return @inSync = yes unless $rootScope.ntn_data
        newSyncVal = @upgradeFormat $rootScope.ntn_data[item.key], item
        return if Utils.equals newSyncVal[0].data, newvalue.data
        newSyncVal.splice(0, 0, newvalue) # Prepend new val
        newSyncVal.splice(-1,1) unless newSyncVal.length <= 5 #Save history of 5
        newSyncVal[0].syncedAt = (new Date()).getTime()
        $rootScope.ntn_data[item.key] = newSyncVal
        if @authenticated
          @inSync = yes
          @setSyncedAt()
        else
          @inSync = no

      fetchAndUpdate: () =>
        promise = @fetch()
        if not promise
          q = $q.defer()
          q.resolve()
          return q.promise
        promise.then( (response) =>
          @setResponse(response)
        )

      fetch: =>
        return unless @authenticated
        CurrentUser.getStore().then( (store)->
          return unless store
          NTN.fetch(store)
        )

      push: =>
        that = @
        return unless @authenticated
        currentLocal = getStorage()
        that = @
        syncKeys.forEach((key) ->
          tmpObj = {key: key, newvalue: (if key isnt 'grass' then JSON.stringify(currentLocal[key]) else currentLocal[key])}
          that.syncItem(tmpObj)
        )

      setResponse: (response) =>
        @conflict = no
        setStorageJSON(response)

      setSyncedAt: ->
        @inSync = yes
        @lastSyncedAt = new Date()

      upgradeFormat: (data, item) ->
        return [@getObjectStruct(data)] unless data
        if item.key is 'grass'
          data = [@getObjectStruct(data)] unless Array.isArray(data)
        else
          data = [@getObjectStruct(data)] unless Array.isArray(data[0].data)
        data

      getObjectStruct: (data) ->
        {data: (data || null), syncedAt: 0, client: Utils.getBrowserName()}

      restoreToVersion: (key, versionTimestamp, cb) ->
        cb = cb || ->
        indexToRestore = $rootScope.ntn_data[key].reduce((pass, curr, index) -> 
          return pass unless curr.syncedAt is versionTimestamp
          index
        , -1)
        return cb('Version not found', null) unless indexToRestore >= 0
        versionToRestore = $rootScope.ntn_data[key][indexToRestore]
        $rootScope.ntn_data[key].splice(indexToRestore, 1)
        setStorageForKey key, versionToRestore['data']
        cb(null, 1)

      authenticated: no
      conflict: no
      inSync: no
      lastSyncedAt: null
      syncKeys: syncKeys

    syncService = new SyncService()
    return syncService
]
