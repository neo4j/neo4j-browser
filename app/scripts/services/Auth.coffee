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
.service 'AuthService', [
  'ConnectionStatusService'
  'ProtocolFactory'
  'Settings'
  '$q'
  (ConnectionStatusService, ProtocolFactory, Settings, $q) ->

    setConnectionAuthData = (username, password, emitChange) ->
      ConnectionStatusService.setConnectionAuthData username, password, emitChange

    clearConnectionAuthData = ->
      ConnectionStatusService.clearConnectionAuthData()

    class AuthService
      constructor: ->

      authenticate: (username, password) =>
        that = @
        @current_password = password
        setConnectionAuthData username, password
        promise = @makeRequest(withoutCredentials = no, retainConnection = yes)
        promise.then(
          (r) ->
            ConnectionStatusService.setConnected yes
            r
          ,
          (r) ->
            that.forget() unless r.status is 403 #Forbidden
            r
        )
        promise

      authorizationRequired: ->
        #Make call without auth headers
        q = $q.defer()
        p = @makeRequest(withoutCredentials = yes, retainConnection = yes)
        p.then(
          (r) ->
            ##Success, no auth required
            clearConnectionAuthData()
            ConnectionStatusService.setAuthorizationRequired no
            ConnectionStatusService.setConnected yes
            q.resolve r
          ,
          (r) ->
            ConnectionStatusService.setAuthorizationRequired yes
            q.reject r
        )
        q.promise

      hasValidAuthorization: (retainConnection = no) ->
        that = @
        q = $q.defer()
        req = @authorizationRequired()
        req.then(
          (r) ->
            ConnectionStatusService.setConnected yes
            q.resolve r
          ,
          (r) ->
            if ConnectionStatusService.connectionAuthData().length > 0
              that.isConnected(retainConnection).then(
                (r) ->
                  q.resolve r
                ,
                (r) ->
                  ConnectionStatusService.setConnected no
                  q.reject r
              )
            else
              ConnectionStatusService.setConnected no
              q.reject r
        )
        q.promise

      isConnected: (retainConnection = no) ->
        that = @
        q = $q.defer()
        p = @makeRequest(withoutCredentials = no, retainConnection)
        p.then(
          (rr) ->
            ConnectionStatusService.setConnected yes
            q.resolve rr
        ,
          (rr) ->
            if rr.status is 401
              that.forget()
            q.reject rr
        )
        q.promise

      makeRequest: (withoutCredentials = no, retainConnection = no) ->
        ProtocolFactory.getStoredProcedureService().makeRequest(withoutCredentials, retainConnection)

      forget: ->
        if @getCurrentUser()
          clearConnectionAuthData()
        ConnectionStatusService.setConnected no
        ProtocolFactory.getStoredProcedureService().clearConnection()

      setNewPassword: (old_passwd, new_passwd) ->
        that = @
        q = $q.defer()
        setConnectionAuthData ConnectionStatusService.connectedAsUser(), old_passwd
        ProtocolFactory.getStoredProcedureService().setNewPassword(ConnectionStatusService.connectedAsUser(), new_passwd)
          .then(
            (r) ->
              setConnectionAuthData ConnectionStatusService.connectedAsUser(), new_passwd, emitChange = yes
              q.resolve r
            ,
            (r) ->
              that.forget() if r.status is 401
              q.reject r
          )
        q.promise

      getCurrentUser: ->
        ConnectionStatusService.connectedAsUser()

    new AuthService()
]
