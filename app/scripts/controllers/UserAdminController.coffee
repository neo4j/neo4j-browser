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
    '$scope', 'Settings', 'ProtocolFactory', 'Features'
  ($scope, Settings, ProtocolFactory, Features) ->

    $scope.autoRefresh = false
    $scope.defaultSelection = ''
    $scope.resetPasswordValue = null
    $scope.fileredUsernames = []
    $scope.Features = Features

    $scope.samePasswordCheck = (user) ->
      user.samePassword = user.resetPasswordValue is user.resetPasswordConfirmationValue

    $scope.showResetPassword = (user, value) ->
      user.shouldShowResetPassword = value

    setSuccessMessage = (message) ->
      $scope.frame.successMessage = message
      $scope.frame.resetError()

    setError = (response) ->
      $scope.frame.successMessage = no
      $scope.frame.setError(response)

    $scope.resetPassword = (user) ->
      unless user.resetPasswordValue is user.resetPasswordConfirmationValue
        user.resetPasswordValue = null
        user.resetPasswordConfirmationValue = null
        user.shouldShowResetPassword = no
        user.shouldShowConfirmation = no
        return setError 'Passwords do not match'
      ProtocolFactory.getStoredProcedureService().changeUserPassword(user.username, user.resetPasswordConfirmationValue).then(() ->
        $scope.refresh()
        setSuccessMessage("Changed password for  #{user.username}")
      ).catch((r) ->
        setError(r)
      )

    $scope.refresh = () ->
      ProtocolFactory.getStoredProcedureService().getUserList().then((response) ->
        $scope.users = response
        $scope.filteredUsernames = response.filter((user) -> $scope.user.username isnt user.username).map((u) -> u.username)
      ).catch((r) -> )

    $scope.activate = (username) ->
      ProtocolFactory.getStoredProcedureService().activateUser(username).then(() ->
        $scope.refresh()
        setSuccessMessage("Activated #{username}")
      ).catch((r) ->
        setError(r)
      )

    $scope.suspend = (username) ->
      ProtocolFactory.getStoredProcedureService().suspendUser(username).then(() ->
        $scope.refresh()
        setSuccessMessage("Suspended #{username}")
      ).catch((r) ->
        setError(r)
      )

    $scope.delete = (username) ->
      ProtocolFactory.getStoredProcedureService().deleteUser(username).then(() ->
        $scope.refresh()
        setSuccessMessage("Deleted #{username}")
      ).catch((r) ->
        setError(r)
      )

    $scope.notCurrentUser = (username) ->
      username in $scope.filteredUsernames
    $scope.showConfirmation = (user) ->
      console.log('user', user)
      user.resetPasswordValue
      user.confirmationLabel = yes
      user.shouldShowResetPassword = no
      user.shouldShowConfirmation = yes

    $scope.$on 'admin.addRoleFor', (event, username, role) ->
      ProtocolFactory.getStoredProcedureService().addUserToRole(username, role).then(() ->
        $scope.refresh()
        setSuccessMessage("Assigned role of #{role} to #{username}")
      ).catch((r) ->
        setError(r)
      )
    $scope.$on 'admin.removeRoleFor', (event, username, role) ->
      ProtocolFactory.getStoredProcedureService().removeRoleFromUser(username, role).then(() ->
        $scope.refresh()
        setSuccessMessage("Removed role of #{role} from #{username}")
      ).catch((r) ->
        setError(r)
      )

    $scope.refresh()
]
