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

'use strict';

angular.module('neo4jApp.services')
.service 'AuthDataService', [
  'localStorageService'
  '$base64'
  (localStorageService, $base64) ->
    cached_authorization_data = localStorageService.get('authorization_data') || ''
    cached_last_user = localStorageService.get('last_user') || ''
    cached_retain_connection_credentials = null
    cached_credential_timeout = null
    @setAuthData = (authdata) ->
      return unless authdata
      @setEncodedAuthData $base64.encode(authdata)
    @setEncodedAuthData = (encoded) ->
      return unless encoded
      cached_authorization_data = encoded
      if @getPolicies().retainConnectionCredentials isnt no
        localStorageService.set('authorization_data', encoded)
    @persistCachedAuthData = ->
      if @getPolicies().retainConnectionCredentials isnt no
        return unless cached_authorization_data isnt localStorageService.get('authorization_data')
        localStorageService.set('authorization_data', cached_authorization_data)
    @clearAuthData = ->
      localStorageService.remove('authorization_data')
      cached_authorization_data = null
    @clearPersistentAuthData = ->
      localStorageService.remove('authorization_data')
    @getAuthData = ->
      return cached_authorization_data || localStorageService.get('authorization_data') || ''
    @getPlainAuthData = ->
      data = @getAuthData()
      if data then $base64.decode(data) else ''
    @setLastUser = (lastUser) ->
      return unless lastUser
      @setEncodedLastUser $base64.encode(lastUser)
    @setEncodedLastUser = (encoded) ->
      return unless encoded
      cached_last_user = encoded
      if @getPolicies().retainConnectionCredentials isnt no
        localStorageService.set('last_user', encoded)
    @persistCachedLastUser = ->
      if @getPolicies().retainConnectionCredentials isnt no
        return unless cached_last_user isnt localStorageService.get('last_user')
        localStorageService.set('last_user', cached_last_user)
    @clearLastUser = ->
      localStorageService.remove('last_user')
      cached_last_user = null
    @clearPersistentLastUser = ->
      localStorageService.remove('last_user')
    @getLastUser= ->
      return cached_last_user || localStorageService.get('last_user') || ''
    @getPlainLastUser = ->
      data = @getLastUser()
      if data then $base64.decode(data) else ''
    @setStoreCredentials = (retainConnectionCredentials) ->
      cached_retain_connection_credentials = retainConnectionCredentials
    @setCredentialTimeout = (credentialTimeout) ->
      cached_credential_timeout = credentialTimeout
    @getPolicies = ->
      return {retainConnectionCredentials: cached_retain_connection_credentials, credentialTimeout: cached_credential_timeout}
    @clearPolicies = ->
      cached_retain_connection_credentials = null
      cached_credential_timeout = null
    @
]
