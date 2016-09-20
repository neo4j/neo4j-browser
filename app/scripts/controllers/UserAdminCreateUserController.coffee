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
    '$scope', 'Settings', 'ProtocolFactory', 'Features'
  ($scope, Settings, ProtocolFactory, Features) ->
    $scope.defaultSelection = ''
    $scope.selectedItem = null
    $scope.resetPasswordValue = null
    $scope.editingRole = true
    $scope.listOfAllKnownRoles = []
    $scope.Features = Features

    $scope.addingUser = no

    setSuccessMessage = (message) ->
      $scope.frame.successMessage = message
      $scope.frame.warningText = no
      $scope.frame.resetError()

    setError = (response) ->
      $scope.frame.successMessage = no
      $scope.frame.warningText =no
      $scope.frame.setError(response)

    setWarning = (warningMessage) ->
      $scope.frame.resetError()
      $scope.frame.successMessage = no
      $scope.frame.warningText = warningMessage

    getNewUserObject = () ->
      {
        fields: {
          username: '',
          password: '',
          passwordConfirmation: '',
          requirePasswordChange: false,
          roles: []
        }
        isAddingRole: false
      }
    $scope.user = getNewUserObject()

    $scope.addNewUser = () ->
      return setWarning "Username required" unless $scope.user.fields.username
      return setWarning "Password required" unless $scope.user.fields.password
      return setWarning "Password confirmation required" unless $scope.user.fields.passwordConfirmation
      return setWarning "Password and password confirmation are different" unless $scope.user.fields.password is $scope.user.fields.passwordConfirmation

      ProtocolFactory.getStoredProcedureService().addNewUser(
        $scope.user.fields.username, $scope.user.fields.password, $scope.user.fields.requirePasswordChange
      ).then(()->
        $scope.roleErrors = {}
        return Promise.all($scope.user.fields.roles.map((role) -> $scope.addRole($scope.user.fields.username, role)))
      ).then(() ->
        $scope.$broadcast 'admin.resetRoles'
        $scope.user = getNewUserObject()
        if Object.keys($scope.roleErrors).length > 0
          errors = Object.keys($scope.roleErrors).map((key) ->
            "Could not add role(s): #{$scope.roleErrors[key].join(', ')} due to #{key}"
          )
          setWarning("User #{$scope.user.fields.username} created but not all roles could be added. #{errors.join('. ')}")
        else
          setSuccessMessage("User #{$scope.user.fields.username} created")
      ).catch((r) ->
          setError(r)
      )

    $scope.fileredUsernames = []

    $scope.addRole = (username, role) ->
      ProtocolFactory.getStoredProcedureService().addUserToRole(username, role).then(
        () ->
          $scope.refresh()
        ,
        (r) ->
          errorMessage = r.errors[0].code + ":" + r.errors[0].message
          $scope.roleErrors[errorMessage] = $scope.roleErrors[errorMessage]  || []
          $scope.roleErrors[errorMessage].push(role)
     )

    $scope.notCurrentUser = (username) ->
      username in $scope.filteredUsernames

    $scope.enableSubmit = () ->
      $scope.user.fields.username isnt '' and $scope.user.fields.password isnt ''

    $scope.$on 'admin.addRoleFor', (event, username, role) ->
      $scope.user.fields.roles.push(role)

    $scope.$on 'admin.removeRoleFor', (event, username, role) ->
      $scope.user.fields.roles.splice($scope.user.fields.roles.indexOf(role), 1)
]
