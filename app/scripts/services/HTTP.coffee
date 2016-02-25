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
  .factory 'HTTP', [
    '$http'
    'Settings'
    ($http, Settings) ->
      httpOptions =
        timeout: (Settings.maxExecutionTime * 1000)
      return {
        transaction: (opts) ->
          opts = angular.extend(
            path: '',
            statements: [],
            method: 'post'
          , opts)
          {path, statements, method} = opts
          path = Settings.endpoint.transaction + path
          method = method.toLowerCase()
          for s in statements
            s.resultDataContents = ['row','graph']
            s.includeStats = true
          path = Settings.host + path unless path.indexOf(Settings.host) is 0
          $http.post(path, {statements: statements}, httpOptions)
      }
  ]
