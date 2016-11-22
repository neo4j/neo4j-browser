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
  .controller 'ParameterCtrl', ['Parameters', '$scope', 'Utils', (Parameters, $scope, Utils) ->
    $scope.setParam = {}

    setParamSet = (key, val) ->
      $scope.setParam = (_obj = {}; _obj[key] = val; _obj)

    setSuccessMessage = () ->
      $scope.frame.successMessage = 'Parameter sucessfully set'

    setParsingError = () ->
      $scope.frame.setCustomError 'Could not interpret the input', null 

    setNotFoundError = () ->
      $scope.frame.setCustomError 'Could not find a defined parameter with that key', null

    parseInput = (input) ->
      matches = Utils.extractCommandParameters 'param', input
      if (matches?)
        [key, value] = matches
        if (value isnt undefined and value isnt null)
          value = try eval('(' + value + ')')
          if typeof value isnt 'undefined'
            Parameters[key] = value
            setParamSet key, Parameters[key]
            setSuccessMessage()
          else
            setParsingError()
        else
          setParamSet key, Parameters[key]
          if typeof Parameters[key] is 'undefined'
            setNotFoundError()
      else
        setParsingError()
    
    parseInput $scope.frame.response

  ]
