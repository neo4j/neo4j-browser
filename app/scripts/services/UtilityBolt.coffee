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
  .factory 'UtilityBolt', [
    'Bolt'
    'Settings'
    'Utils'
    '$q'
    '$rootScope'
    (Bolt, Settings, Utils, $q, $rootScope) ->
      {
        clearConnection: -> Bolt.clearConnection()
        getSchema: ->
          q = $q.defer()
          Bolt.routedReadTransaction(
            "CALL db.indexes() YIELD description, state, type " +
            "WITH COLLECT({description: description, state: state, type: type}) AS indexes " +
            "RETURN 'indexes' AS name, indexes AS items " +
            "UNION " +
            "CALL db.constraints() YIELD description " +
            "WITH COLLECT({description: description}) AS constraints " +
            "RETURN 'constraints' AS name, constraints AS items"
          ).promise.then((result) ->
            return q.resolve(Bolt.constructSchemaResult([], [])) unless result.records.length
            q.resolve(Bolt.constructSchemaResult result.records[0].get('items'), result.records[1].get('items'))
          ).catch( (e) -> q.reject Bolt.constructResult e)
          q.promise

        getMeta: ->
          q = $q.defer()
          Bolt.routedReadTransaction(
            """CALL db.labels() YIELD label
            WITH COLLECT(label) AS labels
            RETURN 'labels' as a, labels as result
            UNION
            CALL db.relationshipTypes() YIELD relationshipType
            WITH COLLECT(relationshipType) AS relationshipTypes
            RETURN 'relationshipTypes'as a, relationshipTypes as result
            UNION
            CALL db.propertyKeys() YIELD propertyKey
            WITH COLLECT(propertyKey) AS propertyKeys
            RETURN 'propertyKeys' as a, propertyKeys as result"""
          ).promise.then((result) ->
            return q.resolve(Bolt.constructMetaResult([], [], [])) unless result.records.length
            res = result.records[0]
            res2 = result.records[1]
            res3 = result.records[2]
            q.resolve(Bolt.constructMetaResult res, res2, res3)
          )
          q.promise

        getUser: ->
          q = $q.defer()
          Bolt.directTransaction('CALL dbms.security.showCurrentUser()').promise
            .then((r) -> q.resolve Bolt.constructUserResult r)
            .catch((e) -> q.reject Bolt.constructResult e)
          q.promise

        getCoreEdgeRole: ->
          q = $q.defer()
          Bolt.directTransaction('CALL dbms.cluster.role()').promise
            .then((r) -> q.resolve Bolt.getClusterRole r)
            .catch((e) -> q.reject Bolt.constructResult e)
          q.promise


        getUserList: ->
          q = $q.defer()
          Bolt.directTransaction('CALL dbms.security.listUsers()').promise
          .then((r) -> q.resolve Bolt.constructUserListResult r)
          .catch((e) -> q.reject Bolt.constructResult e)
          q.promise

        getRolesList: ->
          q = $q.defer()
          Bolt.directTransaction('CALL dbms.security.listRoles() YIELD role').promise
          .then((r) -> q.resolve Bolt.constructRolesListResult r)
          .catch((e) -> q.reject Bolt.constructResult e)
          q.promise

        addNewUser: (username, password, requirePasswordChange) ->
          q = $q.defer()
          Bolt.directTransaction("CALL dbms.security.createUser({username}, {password}, {requirePasswordChange})", {username: username, password: password, requirePasswordChange: requirePasswordChange}).promise
          .then((r) -> q.resolve r)
          .catch((e) -> q.reject Bolt.constructResult e)
          q.promise

        changeUserPassword: (username, password) ->
          q = $q.defer()
          Bolt.directTransaction("CALL dbms.security.changeUserPassword({username}, {password})", {username: username, password: password}).promise
          .then((r) -> q.resolve r)
          .catch((e) -> q.reject Bolt.constructResult e)
          q.promise

        activateUser: (username) ->
          q = $q.defer()
          Bolt.directTransaction("CALL dbms.security.activateUser({username})", {username: username}).promise
          .then((r) -> q.resolve r)
          .catch((e) -> q.reject (Bolt.constructResult e).data)
          q.promise

        suspendUser: (username) ->
          q = $q.defer()
          Bolt.directTransaction("CALL dbms.security.suspendUser({username})", {username: username}).promise
          .then((r) -> q.resolve r)
          .catch((e) -> q.reject (Bolt.constructResult e).data)
          q.promise

        deleteUser: (username) ->
          q = $q.defer()
          Bolt.directTransaction("CALL dbms.security.deleteUser({username})", {username: username}).promise
          .then((r) -> q.resolve r)
          .catch((e) -> q.reject (Bolt.constructResult e).data)
          q.promise

        addUserToRole: (username, role) ->
          q = $q.defer()
          Bolt.directTransaction("CALL dbms.security.addRoleToUser({role}, {username})", {username: username, role: role}).promise
          .then((r) -> q.resolve r)
          .catch((e) -> q.reject (Bolt.constructResult e).data)
          q.promise

        removeRoleFromUser: (username, role) ->
          q = $q.defer()
          Bolt.directTransaction("CALL dbms.security.removeRoleFromUser({role}, {username})", {username: username, role: role}).promise
          .then((r) -> q.resolve r)
          .catch((e) -> q.reject (Bolt.constructResult e).data)
          q.promise

        getVersion: ->
          q = $q.defer()
          Bolt.directTransaction("CALL dbms.components()").promise
            .then((r) -> q.resolve(Bolt.constructVersionResult(r)))
            .catch((e) -> q.reject Bolt.constructResult e)
          q.promise

        getProceduresList: ->
          q = $q.defer()
          Bolt.directTransaction("CALL dbms.procedures()").promise
            .then((r) -> q.resolve(r.records.map((r)->r.get('name'))))
            .catch((e) -> q.reject Bolt.constructResult e)
          q.promise

        getJmx: (whatToGet = []) ->
          q = $q.defer()
          if whatToGet.length is 1
            name = whatToGet[0]
          else
            name = "*:*"
          Bolt.directTransaction("CALL dbms.queryJmx('#{name}')").promise
            .then((r) -> q.resolve(Bolt.constructJmxResult(r)))
            .catch((e) -> q.reject Bolt.constructResult e)
          q.promise

        makeRequest: (withoutCredentials, retainConnection) ->
          q = $q.defer()
          r = Bolt.testConnection withoutCredentials
          r.then((r) ->
            Bolt.connect() if retainConnection
            if (r.credentials_expired)
              errObj = {data: {}}
              errObj.data.password_change = 'true'
              errObj.status = 403
              q.reject errObj
            else
              $rootScope.bolt_connection_failure = no
              return q.resolve({})
          ,(err) ->
            errObj = Bolt.constructResult err
            if errObj.data.errors[0].code is 'Socket.Error' || errObj.data.errors[0].message.indexOf('WebSocket connection failure') == 0
              errObj.status = 0
              $rootScope.bolt_connection_failure = yes  && ! $rootScope.unauthorized
            else
              errObj.status = 401
            q.reject errObj
          )
          q.promise

        setNewPassword: (username, newPasswd) ->
          q = $q.defer()
          Bolt.directTransaction("CALL dbms.changePassword({password})", {password: newPasswd}).promise
            .then((r) -> q.resolve Bolt.constructResult r)
            .catch((e) -> q.reject Bolt.constructResult e)
          q.promise

        getClusterOverview: () ->
          that = @
          q = $q.defer()
          Bolt.directTransaction("CALL dbms.cluster.overview()").promise
            .then((res) ->
              r = Bolt.constructResult res
              cluster = Utils.fakeSingleInstanceCluster r, that.getHost, 'bolt'
              return q.reject r unless cluster
              q.resolve cluster
            )
            .catch((err) ->
              e = Bolt.constructResult err
              cluster = Utils.fakeSingleInstanceCluster e, that.getHost, 'bolt'
              return q.reject e unless cluster
              q.resolve cluster
            )
          q.promise

        getRunningQueries: (cluster = []) ->
          q = $q.defer()
          Bolt.runQueryOnCluster(cluster, 'CALL dbms.listQueries()')
            .then((r) -> q.resolve(r.map((result) ->
              return no if result.state isnt 'fulfilled'
              return Bolt.recursivelyBoltIntToJsNumber Bolt.constructResult result.value
            )))
            .catch((e) -> q.reject Bolt.constructResult e)
          q.promise

        killQuery: (instance, queryId) ->
          Bolt.runQueryOnCluster([instance], 'CALL dbms.killQuery($id)', {id: queryId})

        getProtocol: -> 'bolt'

        getHost: ->
          'bolt://' + Bolt.getBoltHost()

        getServerAddress: Utils.getServerAddressByProtocol.bind(null, 'bolt')

      }
]
