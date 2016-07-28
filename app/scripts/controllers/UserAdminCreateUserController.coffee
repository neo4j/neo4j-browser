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
  .controller 'UserAdminCreateUserController', [
    '$scope', 'Settings', 'ProtocolFactory'
  ($scope, Settings, ProtocolFactory) ->
    $scope.defaultSelection = ''
    $scope.selectedItem = null
    $scope.resetPasswordValue = null
    $scope.editingRole = true
    $scope.listOfAllKnownRoles = []

    getNewUserObject = () ->
      {
        fields: {
          username: '',
          password: '',
          requirePasswordChange: false,
          roles: []
        }
        isAddingRole: false
      }
    $scope.user = getNewUserObject()

    $scope.addNewUser = () ->
      ProtocolFactory.getStoredProcedureService().addNewUser(
        $scope.user.fields.username, $scope.user.fields.password, $scope.user.fields.requirePasswordChange
      ).then(()->
        $scope.user.fields.roles.forEach((role) -> $scope.addRole($scope.user.fields.username, role)) if $scope.user.fields.roles.length isnt 0
      ).then(() ->
        $scope.user = getNewUserObject()
      )

    ProtocolFactory.getStoredProcedureService().getRolesList().then((response) ->
      $scope.listOfAllKnownRoles = response
    ).catch((r) -> )

    $scope.listOfKnownRoles = (roles) ->
      $scope.listOfAllKnownRoles.filter((role) -> !roles.includes(role))

    $scope.showRole = (user) ->
      $scope.user[$scope.users.indexOf(user)].editRole = true

    $scope.hideRole = () ->
      $scope.editingRole = false
      $scope.selectedItem = null

    $scope.appendRole = () ->
      $scope.user.fields.roles.push($scope.selectedItem)
      $scope.user.isAddingRole = false

    $scope.fileredUsernames = []

    $scope.addRole = (username, role) ->
      ProtocolFactory.getStoredProcedureService().addUserToRole(username, role).then(() ->
        $scope.refresh()
      )

    $scope.removeRoleFromUser = (role) ->
      $scope.user.fields.roles.splice($scope.user.fields.roles.indexOf(role), 1)

    $scope.notCurrentUser = (username) ->
      username in $scope.filteredUsernames

    $scope.enableSubmit = () ->
      $scope.user.fields.username isnt '' and $scope.user.fields.password isnt ''
]
