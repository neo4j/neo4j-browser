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
  .controller 'WelcomeController', [
    '$scope'
    'Settings'
    'SettingsStore'
    'Frame'
    'Editor'
    ($scope, Settings, SettingsStore, Frame, Editor) ->
      $scope.settings = Settings

      $scope.start = () ->
        $scope.show.sidebar = no
        $scope.show.editor = no
        Settings['onboarding'] = true
        # SettingsStore.save()

      $scope.introduceEditor = () ->
        Frame.create({input:":play welcome-commands"})
        $scope.show.editor = yes

      $scope.offerSync = () ->
        completeOnboarding()
        Frame.create({input:":play neo4j-sync"})

      $scope.showEditor = () ->
        $scope.show.editor = yes

      $scope.revealInEditor = (content) ->
        Editor.setContent(content)
        $scope.focusEditor()

      $scope.skipIntro = () ->
        completeOnboarding()
        $scope.pickFirstFrame()

      completeOnboarding = () ->
        Frame.closeWhere "#{Settings.cmdchar}play welcome"
        $scope.show.sidebar = yes
        $scope.show.editor = yes
        Settings['onboarding'] = false
        SettingsStore.save()
  ]
