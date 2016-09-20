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
  .factory 'UtilityREST', [
    'Server'
    'Settings'
    '$q'
    (Server, Settings, $q) ->
      {
        clearConnection: -> angular.noop
        getJmx: (whatToGet = []) ->
          Server.jmx(whatToGet)
        mapResult: (columns, data) ->
          returnObject = {}
          columns.forEach((c, i) ->
            returnObject[c] = data[i]
          )
          returnObject
        getUser: ->
          q = $q.defer()
          that = @
          Server.cypher('', { query: 'CALL dbms.security.showCurrentUser()'}).then(
            (res) ->
              mappedResult = that.mapResult res.data.columns, res.data.data[0]
              if mappedResult.roles?
                q.resolve {username: mappedResult.username, roles: mappedResult.roles}
              else
                q.resolve {username: mappedResult.username, roles: ['admin']}
          )
          q.promise

        getCoreEdgeOverview: ->
          q = $q.defer()
          Server.cypher('', { query: 'CALL dbms.cluster.overview()'}).then(
            (res) ->
              debugger
              data = res.data
              overview = data.data.map((member) ->
                {
                  id: member[0]
                  address: member[1]
                  role: member[2]
                }
              )

              q.resolve overview
          )
          q.promise
        getUserList: ->
          q = $q.defer()
          that = @
          Server.cypher('', { query: 'CALL dbms.security.listUsers()'}).then(
            (res) ->
              data = res.data
              users = data.data.map((user) ->
                that.mapResult res.data.columns, user
              )
              q.resolve users
          )
          q.promise

        getRolesList: ->
          q = $q.defer()
          Server.cypher('', { query: 'CALL dbms.security.listRoles() YIELD role'}).then(
            (res) ->
              data = res.data
              users = data.data.map((v) -> v[0])
              q.resolve users
          )
          q.promise

        callUserAdminProcedure: (statement, parameters) ->
          q = $q.defer()
          statements = [{statement: statement, parameters: parameters}]
          p = Server.transaction(
            path: "/commit"
            statements: statements
          )
          q = $q.defer()
          p.then(
            (res) ->
              q.reject res.data if (res.data.errors.length > 0)
              q.resolve true if (res.data.errors.length is 0)
          ,
            (res) ->
              q.reject res
          )
          q.promise

        changeUserPassword: (username, password) ->
          @callUserAdminProcedure("CALL dbms.security.changeUserPassword({username}, {password})", {username: username, password: password})

        addNewUser: (username, password, requirePasswordChange) ->
          @callUserAdminProcedure("CALL dbms.security.createUser({username}, {password}, {requirePasswordChange})", {username: username, password: password, requirePasswordChange: requirePasswordChange})

        suspendUser: (username) ->
          @callUserAdminProcedure("CALL dbms.security.suspendUser({username})", {username: username})


        deleteUser: (username) ->
          @callUserAdminProcedure("CALL dbms.security.deleteUser({username})", {username: username})

        activateUser: (username) ->
          @callUserAdminProcedure("CALL dbms.security.activateUser({username})", {username: username})

        addUserToRole: (username, role) ->
          @callUserAdminProcedure("CALL dbms.security.addRoleToUser({role}, {username})", {username: username, role:role})

        removeRoleFromUser: (username, role) ->
          @callUserAdminProcedure("CALL dbms.security.removeRoleFromUser({role}, {username})", {username: username, role:role})

        getProceduresList: ->
          q = $q.defer()
          Server.cypher('', { query: "CALL dbms.procedures()"}).then(
            (res) ->
              q.resolve res.data.data.map((record) -> record[0])
          )
          q.promise

        getVersion: (version) ->
          q = $q.defer()
          q.resolve Server.version(version)
          q.promise

        getAddresses: ->
          q = $q.defer()
          q.resolve Server.addresses()
          q.promise

        getSchema: (input) ->
          q = $q.defer()
          Server.console(input.substr(1))
          .then(
            (r) ->
              response = r.data[0]
              if response.match('Unknown')
                q.reject(error("Unknown action", null, response))
              else
                q.resolve(response)
          )
          q.promise

        getMeta: ->
          q = $q.defer()
          obj =
            labels: Server.labels()
            relationships: Server.relationships()
            propertyKeys: Server.propertyKeys()
          q.resolve obj
          q.promise

        makeRequest: (withoutCredentials) ->
          opts = if withoutCredentials then {skipAuthHeader: withoutCredentials} else {}
          p = Server.get("#{Settings.endpoint.rest}/", opts)
        setNewPassword: (username, newPasswd) ->
          Server.post("#{Settings.endpoint.authUser}/#{username}/password", {password: newPasswd})
      }
]
