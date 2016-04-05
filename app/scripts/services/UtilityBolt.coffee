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
    (Bolt, Settings, $q) ->
      {
        getSchema: ->
          q = $q.defer()
          $q.all([
            Bolt.callProcedure("db.indexes"),
            Bolt.callProcedure("db.constraints"),
          ]).then((data) ->
            q.resolve(Bolt.constructSchemaResult data[0], data[1])
          )
          q.promise

        getMeta: ->
          q = $q.defer()
          $q.all([
            Bolt.callProcedure("db.labels"),
            Bolt.callProcedure("db.relationshipTypes"),
            Bolt.callProcedure("db.propertyKeys")
          ]).then((data) ->
            q.resolve(Bolt.constructMetaResult data[0], data[1], data[2])
          )
          q.promise

        getVersion: ->
          q = $q.defer()
          Bolt.boltTransaction("CALL sys.components()").promise
            .then((r) -> q.resolve(Bolt.constructVersionResult(r)))
            .catch((e) -> q.reject Bolt.constructResult e)
          q.promise

        getJmx: (whatToGet = []) ->
          q = $q.defer()
          name = if whatToGet.length is 1 then whatToGet[0] else "*:*"
          Bolt.boltTransaction("CALL sys.queryJmx('#{name}')").promise
            .then((r) -> q.resolve(Bolt.constructJmxResult(r, whatToGet)))
            .catch((e) -> q.reject Bolt.constructResult e)
          q.promise

        makeRequest: (withoutCredentials, retainConnection) ->
          q = $q.defer()
          r = Bolt.testConnection withoutCredentials
          r.then((r) -> 
            res = Bolt.constructResult r
            Bolt.connect() if retainConnection
            return q.resolve({}) unless res.data.errors.length
            return q.reject({status: 401, data: res})
          ).catch((err) -> 
            errObj = Bolt.constructResult err
            if errObj.data.errors[0].code is 'Neo.ClientError.Security.CredentialsExpired'
              errObj.data.password_change = 'true'
              errObj.status = 403
            else if errObj.data.errors[0].code is 'Socket.Error'
              errObj.status = 0
            else
              errObj.status = 401
            q.reject errObj
          )
          q.promise
        setNewPassword: (username, newPasswd) ->
          q = $q.defer()
          Bolt.boltTransaction("CALL sys.changePassword({password})", {password: newPasswd}).promise
            .then((r) -> q.resolve Bolt.constructResult r)
            .catch((e) -> q.reject Bolt.constructResult e)
          q.promise
      }
]
