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
.factory 'NTN', [
  'auth', 'Settings', '$q', '$firebaseAuth', '$firebaseObject', '$rootScope'
  (auth, Settings, $q, $firebaseAuth, $firebaseObject, $rootScope) ->
    _unbind = ->
    _sync_object = no

    _getUserStore = (id, token) ->
      q = $q.defer()
      ref = new Firebase("https://fiery-heat-7952.firebaseio.com/users/#{id}/")
      fbauth = $firebaseAuth ref
      fbauth.$authWithCustomToken(token).then(
        (auth_data)->
          if auth_data.expires - Math.round((new Date()).getTime()/1000) < 60*60*12
            $rootScope.$emit 'ntn:token_will_expire'

          q.resolve(ref)
        ,
        (err) ->
          q.reject(err)
      )
      q.promise

    _fetch = (_store) ->
      return no unless _store
      _sync_object = $firebaseObject(_store)
      _sync_object.$bindTo($rootScope, 'ntn_data').then(
        (unbind) ->
          $rootScope.$emit 'ntn:data_loaded', 'yes'
          _unbind = unbind
        ,
        (err)->
          _unbind()
          $rootScope.$emit 'ntn:token_expired'
      )

    _push = (_store, data) ->
      q = $q.defer()
      completed = (err) ->
        return q.resolve() unless err
        q.reject err
      return no unless _store
      _store.set(data, completed)
      q.promise

    _login = ->
      q = $q.defer()
      auth.signin(
        {
          authParams: {scope: 'openid offline_access'},
          icon: 'http://neo4j.com/wp-content/themes/neo4jweb/assets/images/neo4j-logo-2015.png',
          dict: {
            signin: {
              title: 'Sign in'
            }
          }
        }
      , (profile, token, accessToken, state, refreshToken) ->
          auth.getToken({
            api: 'firebase'
          }).then((delegation) ->
            q.resolve(
              profile: profile
              token: token
              accessToken: accessToken
              state: state
              refreshToken: refreshToken
              data_token: delegation.id_token
            )
          )
      , (err)->
        q.reject err
      )
      q.promise

    _refreshTokens = (refreshToken) ->
      q = $q.defer()
      auth.getToken(
        refresh_token: refreshToken
        api: 'auth0'
      ).then((auth0_res) ->
        auth.getToken(
          api: 'firebase'
          id_token: auth0_res.id_token
        ).then((fb_res)->
          q.resolve(
            token: auth0_res.id_token
            data_token: fb_res.id_token
          )
        )
      )
      q.promise

    return {
      login: _login
      logout: ->
        auth.signout()
        _unbind()
        _sync_object = {}
      authenticate: (profile, token) ->
        auth.authenticate(profile, token).then(-> _unbind())
      isAuthenticated: -> auth.isAuthenticated
      refreshToken: _refreshTokens
      fetch: _fetch
      push: _push
      getUserStore: _getUserStore
    }
]
