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

        getUser: ->
          q = $q.defer()
          Server.cypher('', { query: 'CALL dbms.showCurrentUser()'}).then(
            (res) ->
              data = res.data
              user = data.data[0]
              q.resolve {username: user[0], roles: user[1]}
          )
          q.promise
        getUserList: ->
          q = $q.defer()
          Server.cypher('', { query: 'CALL dbms.listUsers()'}).then(
            (res) ->
              data = res.data
              users = data.data.map((user) ->
                {
                  username: user[0],
                  roles: user[1],
                  flags: user[2]
                }
              )
              q.resolve users
          )
          q.promise

        getRolesList: ->
          q = $q.defer()
          Server.cypher('', { query: 'CALL dbms.listRoles() YIELD role'}).then(
            (res) ->
              data = res.data
              users = data.data.map((v) -> v[0])
              q.resolve users
          )
          q.promise

        addNewUser: (username, password, requirePasswordChange) ->
          q = $q.defer()
          Server.cypher('', { query: "CALL dbms.createUser('#{username}', '#{password}', #{requirePasswordChange})"}).then(
            (res) ->
              q.resolve res
          )
          q.promise

        suspendUser: (username) ->
          q = $q.defer()
          Server.cypher('', { query: "CALL dbms.suspendUser('#{username}')"}).then(
            (res) ->
              q.resolve res
          )
          q.promise

        deleteUser: (username) ->
          q = $q.defer()
          Server.cypher('', { query: "CALL dbms.deleteUser('#{username}')"}).then(
            (res) ->
              q.resolve res
          )
          q.promise

        activateUser: (username) ->
          q = $q.defer()
          Server.cypher('', { query: "CALL dbms.activateUser('#{username}')"}).then(
            (res) ->
              q.resolve true
          )
          q.promise

        addUserToRole: (username, role) ->
          q = $q.defer()
          Server.cypher('', { query: "CALL dbms.addUserToRole('#{username}', '#{role}')"}).then(
            (res) ->
              q.resolve true
          )
          q.promise

        removeRoleFromUser: (username, role) ->
          q = $q.defer()
          Server.cypher('', { query: "CALL dbms.removeUserFromRole('#{username}', '#{role}')"}).then(
            (res) ->
              q.resolve true
          )
          q.promise

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
