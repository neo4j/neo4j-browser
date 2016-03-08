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

describe 'Service: AuthService', () ->

  $scope = {}
  timeout = {}
  AuthService = {}
  Settings = {}
  SettingsStore = {}
  httpBackend = {}
  AuthDataService = {}
  ConnectionStatusService = {}
  localStorageService = {}
  beforeEach ->
    module 'neo4jApp.services'

  beforeEach ->
    inject(($rootScope, _AuthService_, _Settings_, _SettingsStore_, _AuthDataService_, _ConnectionStatusService_, _localStorageService_, $httpBackend, $timeout) ->
      $scope = $rootScope
      AuthService = _AuthService_
      Settings = _Settings_
      SettingsStore = _SettingsStore_
      AuthDataService = _AuthDataService_
      ConnectionStatusService = _ConnectionStatusService_
      localStorageService = _localStorageService_
      httpBackend = $httpBackend
      timeout = $timeout
    )

  describe ' - Auth tests', ->

    it ' - Persist auth data in localstorage', ->
      httpBackend.when('GET', "#{Settings.endpoint.rest}/")
        .respond(->
          return [200, JSON.stringify({})]
        )

      data = {}
      AuthService.authenticate('test', 'test')
        .then( (response) ->
          data = response.data
        )
      $scope.$apply() if not $scope.$$phase
      httpBackend.flush()

      expect(AuthDataService.getAuthData()).toBe('dGVzdDp0ZXN0')
      expect(ConnectionStatusService.connectedAsUser()).toBe('test')
      expect(localStorageService.get('authorization_data')).toBe('dGVzdDp0ZXN0')

    it ' - Empty auth token in persistent storage on unsuccessful authentication', ->
      ConnectionStatusService.setConnectionAuthData('sample', 'error')
      httpBackend.when('GET', "#{Settings.endpoint.rest}/").respond(401, JSON.stringify({}))
      AuthService.authenticate('test', 'test')
      $scope.$apply() if not $scope.$$phase
      httpBackend.flush()
      expect(AuthDataService.getAuthData()).toBeFalsy()

    it ' - ConnectionStatusSummary should be correct when auth FAILED', ->
      ConnectionStatusService.setConnectionAuthData('sample', 'error')
      httpBackend.when('GET', "#{Settings.endpoint.rest}/").respond(401, JSON.stringify({}))
      AuthService.hasValidAuthorization()
      $scope.$apply() if not $scope.$$phase
      httpBackend.flush()
      status = ConnectionStatusService.getConnectionStatusSummary()
      expect(status.user).toBeFalsy()
      expect(status.is_connected).toBe false
      expect(status.authorization_required).toBe true

    it ' - ConnectionStatusSummary should be correct when auth is disabled on server', ->
      httpBackend.when('GET', "#{Settings.endpoint.rest}/").respond(200, JSON.stringify({}))
      AuthService.hasValidAuthorization()
      $scope.$apply() if not $scope.$$phase
      httpBackend.flush()
      status = ConnectionStatusService.getConnectionStatusSummary()
      expect(status.is_connected).toBe true
      expect(status.authorization_required).toBe false

    it ' - should wait for version and edition before setting policies', ->
      ConnectionStatusService.setAuthPolicies {retainConnectionCredentials: no, credentialTimeout: 0}
      expect(AuthDataService.getPolicies().retainConnectionCredentials).toBe(null)
      $scope.neo4j = {version: '1.0', edition: 'enterprise', enterpriseEdition: yes}
      $scope.$emit 'db:updated:edition', $scope.neo4j.edition
      expect(AuthDataService.getPolicies().retainConnectionCredentials).toBe(no)

    it ' - should honor retainConnectionCredentials flag on enterprise', ->
      $scope.neo4j = {version: '1.0', edition: 'enterprise', enterpriseEdition: yes}
      $scope.$emit 'db:updated:edition', $scope.neo4j.edition
      ConnectionStatusService.setAuthPolicies {retainConnectionCredentials: no, credentialTimeout: 0}
      httpBackend.when('GET', "#{Settings.endpoint.rest}/")
      .respond(->
        return [200, JSON.stringify({})]
      )
      data = {}
      AuthService.authenticate('test', 'test')
      .then( (response) ->
        data = response.data
      )
      $scope.$apply() if not $scope.$$phase
      httpBackend.flush()
      expect(AuthDataService.getAuthData()).toBe('dGVzdDp0ZXN0')
      expect(ConnectionStatusService.connectedAsUser()).toBe('test')
      expect(localStorageService.get('authorization_data')).toBeFalsy()

      ConnectionStatusService.setAuthPolicies {retainConnectionCredentials: yes, credentialTimeout: 0}
      expect(localStorageService.get('authorization_data')).toBe('dGVzdDp0ZXN0')

      Settings.retainConnectionCredentials = no
      SettingsStore.save()
      expect(localStorageService.get('authorization_data')).toBeFalsy()

      Settings.retainConnectionCredentials = yes
      SettingsStore.save()
      expect(localStorageService.get('authorization_data')).toBe('dGVzdDp0ZXN0')

      ConnectionStatusService.setAuthPolicies {retainConnectionCredentials: yes, credentialTimeout: 600}
      expect(localStorageService.get('authorization_data')).toBe('dGVzdDp0ZXN0')
      timeout.flush()
      expect(localStorageService.get('authorization_data')).toBeFalsy()

    it ' - should not honor retainConnectionCredentials flag on community', ->
      $scope.neo4j = {version: '1.0', edition: 'community', enterpriseEdition: no}
      $scope.$emit 'db:updated:edition', $scope.neo4j.edition
      ConnectionStatusService.setAuthPolicies {retainConnectionCredentials: no, credentialTimeout: 0}
      httpBackend.when('GET', "#{Settings.endpoint.rest}/")
      .respond(->
        return [200, JSON.stringify({})]
      )
      data = {}
      AuthService.authenticate('test', 'test')
      .then( (response) ->
        data = response.data
      )
      $scope.$apply() if not $scope.$$phase
      httpBackend.flush()
      expect(AuthDataService.getAuthData()).toBe('dGVzdDp0ZXN0')
      expect(ConnectionStatusService.connectedAsUser()).toBe('test')
      expect(localStorageService.get('authorization_data')).toBe('dGVzdDp0ZXN0')

      ConnectionStatusService.setAuthPolicies {retainConnectionCredentials: yes, credentialTimeout: 0}
      expect(localStorageService.get('authorization_data')).toBe('dGVzdDp0ZXN0')

      Settings.retainConnectionCredentials = no
      SettingsStore.save()
      expect(localStorageService.get('authorization_data')).toBe('dGVzdDp0ZXN0')

      Settings.retainConnectionCredentials = yes
      SettingsStore.save()
      expect(localStorageService.get('authorization_data')).toBe('dGVzdDp0ZXN0')

      ConnectionStatusService.setAuthPolicies {retainConnectionCredentials: yes, credentialTimeout: 600}
      expect(localStorageService.get('authorization_data')).toBe('dGVzdDp0ZXN0')
      timeout.flush()
      expect(localStorageService.get('authorization_data')).toBe('dGVzdDp0ZXN0')

    it ' - should not store credentials when connecting with retainConnectionCredentials flag false on enterprise', ->
      Settings.retainConnectionCredentials = no
      $scope.neo4j = {version: '1.0', edition: 'enterprise', enterpriseEdition: yes}
      $scope.$emit 'db:updated:edition', $scope.neo4j.edition
      ConnectionStatusService.setAuthPolicies {retainConnectionCredentials: yes, credentialTimeout: 0}
      httpBackend.when('GET', "#{Settings.endpoint.rest}/")
      .respond(->
        return [200, JSON.stringify({})]
      )
      data = {}
      AuthService.authenticate('test', 'test')
      .then( (response) ->
        data = response.data
      )
      $scope.$apply() if not $scope.$$phase
      httpBackend.flush()
      expect(AuthDataService.getAuthData()).toBe('dGVzdDp0ZXN0')
      expect(ConnectionStatusService.connectedAsUser()).toBe('test')
      expect(localStorageService.get('authorization_data')).toBeFalsy()

      it ' - should store credentials when connecting with retainConnectionCredentials flag false on community', ->
      Settings.retainConnectionCredentials = no
      $scope.neo4j = {version: '1.0', edition: 'community', enterpriseEdition: no}
      $scope.$emit 'db:updated:edition', $scope.neo4j.edition
      ConnectionStatusService.setAuthPolicies {retainConnectionCredentials: yes, credentialTimeout: 0}
      httpBackend.when('GET', "#{Settings.endpoint.rest}/")
      .respond(->
        return [200, JSON.stringify({})]
      )
      data = {}
      AuthService.authenticate('test', 'test')
      .then( (response) ->
        data = response.data
      )
      $scope.$apply() if not $scope.$$phase
      httpBackend.flush()
      expect(AuthDataService.getAuthData()).toBe('dGVzdDp0ZXN0')
      expect(ConnectionStatusService.connectedAsUser()).toBe('test')
      expect(localStorageService.get('authorization_data')).toBe('dGVzdDp0ZXN0')
