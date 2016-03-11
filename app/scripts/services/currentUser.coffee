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
.service 'CurrentUser', [
  'Settings'
  'Editor'
  'AuthService'
  'NTN'
  'localStorageService'
  'AuthDataService'
  'jwtHelper'
  '$q'
  '$rootScope'
  (Settings, Editor, AuthService, NTN, localStorageService, AuthDataService, jwtHelper, $q, $rootScope) ->
    class CurrentUser
      _user: {}
      store: null

      getStoreCreds: ->
        local = localStorageService.get 'stores'
        local || []

      setStoreCreds: (creds_array) ->
        localStorageService.set 'stores', creds_array

      addCurrentStoreCreds: (id) ->
        creds = @getStoreCreds()
        current_creds = AuthDataService.getAuthData()
        return unless current_creds
        creds.push({store_id: id, creds: current_creds})
        @setStoreCreds creds

      removeCurrentStoreCreds: (id) ->
        creds = @getStoreCreds()
        for cred, i in creds
          if cred.store_id is id
            creds.splice i, 1
            break
        @setStoreCreds creds

      getCurrentStoreCreds: (id) ->
        creds = @getStoreCreds()
        for cred in creds
          if cred.store_id is id
            return cred
        return {}

      fetch: ->
        NTN.fetch @store

      getToken: (id) ->
        return no unless id
        localStorageService.get "ntn_#{id}"

      loadUserFromLocalStorage: ->
        return unless @isAuthenticated()
        q = $q.defer()
        that = @
        @_user = localStorageService.get 'ntn_profile' || {}
        data_token = @getToken 'data_token'
        @store = no
        if @_user and data_token
          NTN.getUserStore(@_user.user_id, data_token).then(
            (store) ->
              that.store = store
              q.resolve()
              $rootScope.$emit 'ntn:authenticated', 'yes'
          )
        else
          q.resolve()
        q.promise

      getStore: ->
        that = @
        q = $q.defer()

        if @store && @store.getAuth()
          q.resolve @store
          return q.promise

        @refreshToken().then(
          q.resolve that.store
        )
        q.promise

      persist: (res) =>
        if res.token then localStorageService.set 'ntn_token', res.token
        if res.data_token then localStorageService.set 'ntn_data_token', res.data_token
        if res.profile then localStorageService.set 'ntn_profile', res.profile
        if res.refreshToken then localStorageService.set 'ntn_refresh_token', res.refreshToken
        @loadUserFromLocalStorage()

      clear: () ->
        localStorageService.clearAll()
        @loadUserFromLocalStorage()

      login: ->
        q = $q.defer()
        that = @

        @autoLogin().then(
          ->
            q.resolve()
          ,
          ->
            NTN.login().then((res) ->
              that.persist res
              that.autoLogin()
              q.resolve(res)
            )
        )
        q.promise

      logout: ->
        q = $q.defer()
        $rootScope.currentUser = null
        NTN.logout()
        localStorageService.remove 'ntn_token'
        localStorageService.remove 'ntn_data_token'
        localStorageService.remove 'ntn_refresh_token'
        localStorageService.remove 'ntn_profile'
        localStorageService.remove 'stores'
        AuthService.forget().finally( ->
          q.resolve()
          Editor.execScript "#{Settings.cmdchar}server disconnect"
        )
        q.promise

      instance: -> angular.copy(@_user)

      isAuthenticated: -> NTN.isAuthenticated()

      autoLogin: ->
        that = @
        q = $q.defer()
        if NTN.isAuthenticated()
          q.resolve()
          return q.promise
        token = localStorageService.get('ntn_token')
        if not token
          q.reject()
          return q.promise
        if not jwtHelper.isTokenExpired token
          NTN.authenticate(localStorageService.get('ntn_profile'), token).then(
            ->
              that.loadUserFromLocalStorage()
              q.resolve()
            ,
              q.reject()
          )
        else
          that.refreshToken().then(
            ->
              that.autoLogin().then(
                ->
                  q.resolve()
              )
          )
        q.promise

      refreshToken: ->
        that = @
        NTN.refreshToken(localStorageService.get('ntn_refresh_token')).then((token)->
          that.persist({token: token.token, data_token: token.data_token})
          that.autoLogin()
        )

      $rootScope.$on 'ntn:token_will_expire', () ->
        cu.refreshToken()

      $rootScope.$on 'ntn:token_expired', () ->
        cu.autoLogin()

    cu = new CurrentUser
    cu
]
