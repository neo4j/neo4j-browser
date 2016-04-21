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

angular.module('neo4jApp.controllers')
  .config ($provide, $compileProvider, $filterProvider, $controllerProvider) ->
    $controllerProvider.register 'MainCtrl', [
      '$rootScope',
      '$window'
      '$q'
      'Server'
      'Frame'
      'AuthService'
      'AuthDataService'
      'ConnectionStatusService'
      'Settings'
      'SettingsStore'
      'motdService'
      'UsageDataCollectionService'
      'Utils'
      'CurrentUser'
      'ProtocolFactory'
      ($scope, $window,$q, Server, Frame, AuthService, AuthDataService, ConnectionStatusService, Settings, SettingsStore, motdService, UDC, Utils, CurrentUser, ProtocolFactory) ->
        $scope.CurrentUser = CurrentUser
        $scope.ConnectionStatusService = ConnectionStatusService

        $scope.kernel = {}
        $scope.refresh = ->
          return '' if $scope.unauthorized || $scope.offline
          $scope.server = Server.info $scope.server
          $scope.host = $window.location.host
          $q.when()
          .then( ->
            ProtocolFactory.getMetaService().getMeta().then((res) ->
              $scope.labels = res.labels
              $scope.relationships = res.relationships
              $scope.propertyKeys = res.propertyKeys
            )
          ).then( ->
            ProtocolFactory.getVersionService().getVersion($scope.version).then((res) ->
              $scope.version = res
            )
          ).then( ->
            fetchJMX()
          )

        fetchJMX = ->
          ProtocolFactory.getJmxService().getJmx([
            "org.neo4j:instance=kernel#0,name=Configuration"
            "org.neo4j:instance=kernel#0,name=Kernel"
            "org.neo4j:instance=kernel#0,name=Store file sizes"
          ]).then((response) ->
            for r in response.data
              for a in r.attributes
                $scope.kernel[a.name] = a.value
            $scope.neo4j.store_id = $scope.kernel['StoreId']
            UDC.updateStoreAndServerVersion($scope.server.neo4j_version, $scope.kernel['StoreId'])
            refreshPolicies $scope.kernel['browser.retain_connection_credentials'], $scope.kernel['browser.credential_timeout']
            allow_connections = [no, 'false', 'no'].indexOf($scope.kernel['browser.allow_outgoing_browser_connections']) < 0 ? yes : no
            refreshAllowOutgoingConnections allow_connections
          ).catch((r)-> $scope.kernel = {})

        refreshAllowOutgoingConnections = (allow_connections) ->
          return unless $scope.neo4j.config.allow_outgoing_browser_connections != allow_connections
          allow_connections = if $scope.neo4j.enterpriseEdition then allow_connections else yes
          mapServerConfig 'allow_outgoing_browser_connections', allow_connections
          if allow_connections
            $scope.motd.refresh()
            UDC.loadUDC()
          else if not allow_connections
            UDC.unloadUDC()

        refreshPolicies = (retainConnectionCredentials = yes, credentialTimeout = 0) ->
          retainConnectionCredentials = [no, 'false', 'no'].indexOf(retainConnectionCredentials) < 0 ? yes : no
          credentialTimeout = Utils.parseTimeMillis(credentialTimeout) / 1000
          ConnectionStatusService.setAuthPolicies {retainConnectionCredentials, credentialTimeout}

        mapServerConfig = (key, val) ->
          return unless $scope.neo4j.config[key] != val
          $scope.neo4j.config[key] = val

        $scope.identity = angular.identity

        $scope.motd = motdService
        $scope.auth_service = AuthService

        $scope.neo4j =
          license =
            type: "GPLv3"
            url: "http://www.gnu.org/licenses/gpl.html"
            edition: 'community'
            enterpriseEdition: no
        $scope.neo4j.config = {}

        $scope.$on 'db:changed:labels', $scope.refresh

        $scope.today = Date.now()
        $scope.cmdchar = Settings.cmdchar

        $scope.goodBrowser = !/msie/.test(navigator.userAgent.toLowerCase())

        $scope.$watch 'offline', (serverIsOffline) ->
          if (serverIsOffline?)
            if not serverIsOffline
              UDC.trackConnectEvent()
            else
              $scope.errorMessage = motdService.pickRandomlyFromChoiceName('disconnected')

        $scope.$on 'auth:status_updated', (e, is_connected) ->
          $scope.check()
          if is_connected
            ConnectionStatusService.setSessionStartTimer new Date()

        setAndSaveSetting = (key, value) ->
          Settings[key] = value
          SettingsStore.save()

        onboardingSequence = ->
          Frame.createOne({input:"#{Settings.cmdchar}play welcome"})

        pickFirstFrame = ->
          CurrentUser.init()
          AuthService.hasValidAuthorization(retainConnection = yes).then(
            ->
              Frame.closeWhere "#{Settings.cmdchar}server connect"
              Frame.createOne({input:"#{Settings.initCmd}"})
              onboardingSequence() if Settings.onboarding
            ,
            (r) ->
              if Settings.onboarding then onboardingSequence()
              else Frame.createOne({input:"#{Settings.cmdchar}server connect"})
          )

        $scope.pickFirstFrame = pickFirstFrame

        pickFirstFrame()

        $scope.$on 'ntn:data_loaded', (evt, authenticated, newUser) ->
          return Frame.createOne({input:"#{Settings.initCmd}"}) if ConnectionStatusService.isConnected()
          return Frame.create({input:"#{Settings.cmdchar}play welcome"}) if newUser
          return Frame.create({input:"#{Settings.cmdchar}server connect"}) if !newUser

        $scope.$watch 'version', (val) ->
          return '' if not val
          $scope.neo4j.version = val.version
          $scope.neo4j.edition = val.edition
          $scope.neo4j.enterpriseEdition = val.edition is 'enterprise'
          $scope.$emit 'db:updated:edition', val.edition
          if val.version then $scope.motd.setCallToActionVersion(val.version)
        , true
    ]

  .run([
    '$rootScope'
    ($scope) ->
      $scope.unauthorized = yes
  ])
