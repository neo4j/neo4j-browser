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
  '$rootScope'
  (localStorageService, NTN, CurrentUser, Utils, $rootScope) ->

    sync_keys = ['documents', 'folders', 'grass', 'stores']
    setStorageJSON = (response) ->
      for key in sync_keys
        if typeof response[key] is 'undefined'
          localStorageService.remove key
          continue
        localStorageService.set key, response[key]

      # Trigger localstorage event for updated_at last, since that is used
      # to set inSync to true
      localStorageService.set('updated_at', 1)
      response

    getStorageJSON = ->
      keys = localStorageService.keys()
      d = {}
      d[k] = localStorageService.get(k) for k in keys
      JSON.stringify(d)

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
        setStorageJSON ntn_data

    class SyncService
      constructor: ->

        $rootScope.$on 'LocalStorageModule.notification.setitem', (evt, item) =>
          return @setSyncedAt() if item.key is 'updated_at'
          return unless item.key in sync_keys
          newvalue = if item.key is 'grass' then item.newvalue else JSON.parse item.newvalue
          return @inSync = yes unless $rootScope.ntn_data
          return if $rootScope.ntn_data[item.key] is newvalue
          $rootScope.ntn_data[item.key] = newvalue
          if @authenticated
            @inSync = yes
            @setSyncedAt()
          else
            @inSync = no

        $rootScope.$on 'ntn:authenticated', (evt, authenticated) =>
          @authenticated = authenticated
          @fetch() if authenticated

      fetchAndUpdate: () =>
        promise = @fetch()
        return unless promise
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
        CurrentUser.getStore().then( (store)->
          pushing = NTN.push(store, getStorage())
          return unless pushing
          pushing.then(=>
            that.fetch()
          )
        )

      setResponse: (response) =>
        @conflict = no
        setStorageJSON(response)

      setSyncedAt: ->
        @inSync = yes
        @lastSyncedAt = new Date()

      authenticated: no
      conflict: no
      inSync: no
      lastSyncedAt: null

    syncService = new SyncService()
    return syncService
]
