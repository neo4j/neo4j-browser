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
angular.module('neo4jApp.directives')
  .directive('userRoles', ['$rootScope', 'ProtocolFactory', ($rootScope, ProtocolFactory) ->
    restrict: 'A',
    templateUrl: 'views/partials/user-roles.html',
    scope:
      user:'=ngModel'

    link: (scope) ->

      scope.selectedItem = null
      scope.isAddingRole = false
      scope.listOfAllKnownRoles = []
      scope.listOfAssignedRoles = () ->
        scope.user.roles

      scope.listOfKnownRoles = () ->
        scope.listOfAllKnownRoles.filter((role) -> !scope.user.roles.includes(role))

      ProtocolFactory.getStoredProcedureService().getRolesList().then((response) ->
        scope.listOfAllKnownRoles = response
      ).catch((r) -> )

      scope.$on 'admin.resetRoles', (event) ->
        scope.hideRole()

      scope.hideRole = () ->
        scope.isAddingRole = false
        scope.selectedItem = null

      scope.showRole = () ->
        scope.isAddingRole = true

      scope.appendRole = () ->
        if scope.selectedItem?
          scope.$emit 'admin.addRoleFor', scope.user.username, scope.selectedItem
          scope.hideRole()

      scope.removeRole = (role) ->
        scope.$emit 'admin.removeRoleFor', scope.user.username, role

  ])
