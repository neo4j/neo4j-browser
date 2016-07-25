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
  .controller 'UserAdminController', [
    '$scope', 'Settings', 'ProtocolFactory'
  ($scope, Settings, ProtocolFactory) ->
    $scope.selectedItem = null
    $scope.autoRefresh = false
    $scope.defaultSelection = ''

    ProtocolFactory.getStoredProcedureService().getRolesList().then((response) ->
      $scope.listOfAllKnownRoles = response
    ).catch((r) -> )

    $scope.listOfKnownRoles = (roles) ->
      $scope.listOfAllKnownRoles.filter((role) -> !roles.includes(role))

    $scope.editingRole = (user) ->
      $scope.users[$scope.users.indexOf(user)].editRole

    $scope.showRole = (user) ->
      $scope.users[$scope.users.indexOf(user)].editRole = true

    $scope.hideRole = (user) ->
      $scope.users[$scope.users.indexOf(user)].editRole = false

    $scope.appendRole = (user, role) ->
      if role? then $scope.addRole(user.username, role) else $scope.showRole(user)

    $scope.fileredUsernames = []

    $scope.refresh = () ->
      ProtocolFactory.getStoredProcedureService().getUserList().then((response) ->
        $scope.users = response
        $scope.filteredUsernames = response.filter((user) -> $scope.user.username isnt user.username).map((u) -> u.username)
      ).catch((r) -> )

    $scope.activate = (username) ->
      ProtocolFactory.getStoredProcedureService().activateUser(username).then(() ->
        $scope.refresh()
      ).catch((r) -> )

    $scope.suspend = (username) ->
      ProtocolFactory.getStoredProcedureService().suspendUser(username).then(() ->
        $scope.refresh()
      ).catch((r) -> )

    $scope.delete = (username) ->
      ProtocolFactory.getStoredProcedureService().deleteUser(username).then(() ->
        $scope.refresh()
      ).catch((r) -> )

    $scope.addRole = (username, role) ->
      ProtocolFactory.getStoredProcedureService().addUserToRole(username, role).then(() ->
        $scope.refresh()
      )

    $scope.removeRoleFromUser = (user, role) ->
      ProtocolFactory.getStoredProcedureService().removeRoleFromUser(user.username, role).then(() ->
        $scope.refresh()
      )
    $scope.notCurrentUser = (username) ->
      username in $scope.filteredUsernames

    $scope.refresh()
]
