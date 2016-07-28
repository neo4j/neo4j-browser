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

    $scope.autoRefresh = false
    $scope.defaultSelection = ''
    $scope.resetPasswordValue = null
    $scope.fileredUsernames = []

    $scope.showResetPassword = (user, value) ->
      user.shouldShowResetPassword = value

    $scope.resetPassword = (username, resetPasswordValue) ->
      ProtocolFactory.getStoredProcedureService().changeUserPassword(username, resetPasswordValue).then(() ->
        $scope.refresh()
      )

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

    $scope.notCurrentUser = (username) ->
      username in $scope.filteredUsernames

    $scope.$on 'addRoleFor', (event, username, role) ->
      ProtocolFactory.getStoredProcedureService().addUserToRole(username, role).then(() ->
        $scope.refresh()
      )
    $scope.$on 'removeRoleFor', (event, username, role) ->
      ProtocolFactory.getStoredProcedureService().removeRoleFromUser(username, role).then(() ->
        $scope.refresh()
      )

    $scope.refresh()
]
