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
    '$q'
    '$rootScope'
    (Bolt, Settings, $q, $rootScope) ->
      {
        clearConnection: -> Bolt.clearConnection()
        getSchema: ->
          q = $q.defer()
          Bolt.boltTransaction(
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
          Bolt.boltTransaction(
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
          Bolt.boltTransaction('CALL dbms.showCurrentUser()').promise
            .then((r) -> q.resolve Bolt.constructUserResult r)
            .catch((e) -> q.reject Bolt.constructResult e)
          q.promise


        getUserList: ->
          q = $q.defer()
          Bolt.boltTransaction('CALL dbms.listUsers()').promise
          .then((r) -> q.resolve Bolt.constructUserListResult r)
          .catch((e) -> q.reject Bolt.constructResult e)
          q.promise

        getRolesList: ->
          q = $q.defer()
          Bolt.boltTransaction('CALL dbms.listRoles() YIELD role').promise
          .then((r) -> q.resolve Bolt.constructRolesListResult r)
          .catch((e) -> q.reject Bolt.constructResult e)
          q.promise

        activateUser: (username) ->
          q = $q.defer()
          Bolt.boltTransaction("CALL dbms.activateUser('#{username}')").promise
          .then((r) -> q.resolve r)
          .catch((e) -> q.reject Bolt.constructResult e)
          q.promise

        suspendUser: (username) ->
          q = $q.defer()
          Bolt.boltTransaction("CALL dbms.suspendUser('#{username}')").promise
          .then((r) -> q.resolve r)
          .catch((e) -> q.reject Bolt.constructResult e)
          q.promise

        deleteUser: (username) ->
          q = $q.defer()
          Bolt.boltTransaction("CALL dbms.deleteUser('#{username}')").promise
          .then((r) -> q.resolve r)
          .catch((e) -> q.reject Bolt.constructResult e)
          q.promise

        addUserToRole: (username, role) ->
          q = $q.defer()
          Bolt.boltTransaction("CALL dbms.addUserToRole('#{username}', '#{role}')").promise
          .then((r) -> q.resolve r)
          .catch((e) -> q.reject Bolt.constructResult e)
          q.promise

        removeRoleFromUser: (username, role) ->
          q = $q.defer()
          Bolt.boltTransaction("CALL dbms.removeUserFromRole('#{username}', '#{role}')").promise
          .then((r) -> q.resolve r)
          .catch((e) -> q.reject Bolt.constructResult e)
          q.promise

        getVersion: ->
          q = $q.defer()
          Bolt.boltTransaction("CALL dbms.components()").promise
            .then((r) -> q.resolve(Bolt.constructVersionResult(r)))
            .catch((e) -> q.reject Bolt.constructResult e)
          q.promise

        getJmx: (whatToGet = []) ->
          q = $q.defer()
          name = if whatToGet.length is 1 then whatToGet[0] else "*:*"
          Bolt.boltTransaction("CALL dbms.queryJmx('#{name}')").promise
            .then((r) -> q.resolve(Bolt.constructJmxResult(r, whatToGet)))
            .catch((e) -> q.reject Bolt.constructResult e)
          q.promise

        makeRequest: (withoutCredentials, retainConnection) ->
          q = $q.defer()
          r = Bolt.testConnection withoutCredentials
          r.then((r) ->
            res = Bolt.constructResult r
            Bolt.connect() if retainConnection
            if not res.data.errors.length
              $rootScope.bolt_connection_failure = no
              return q.resolve({})
            else
              return q.reject({status: 401, data: res})
          ).catch((err) ->
            errObj = Bolt.constructResult err
            if errObj.data.errors[0].code is 'Neo.ClientError.Security.CredentialsExpired'
              errObj.data.password_change = 'true'
              errObj.status = 403
              Bolt.connect() if retainConnection
            else if errObj.data.errors[0].code is 'Socket.Error' || errObj.data.errors[0].message.indexOf('WebSocket connection failure') == 0
              errObj.status = 0
              $rootScope.bolt_connection_failure = yes
            else
              errObj.status = 401
            q.reject errObj
          )
          q.promise
        setNewPassword: (username, newPasswd) ->
          q = $q.defer()
          Bolt.boltTransaction("CALL dbms.changePassword({password})", {password: newPasswd}).promise
            .then((r) -> q.resolve Bolt.constructResult r)
            .catch((e) -> q.reject Bolt.constructResult e)
          q.promise
      }
]
