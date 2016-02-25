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
  .factory 'CypherResult', [
    '$rootScope'
    ($rootScope) ->
      class CypherResult
        constructor: (@_response = {}) ->
          @nodes = []
          @other = []
          @relationships = []
          @size = 0
          @displayedSize = 0
          @stats = {}

          @size = @_response.data?.length or 0
          @displayedSize = @size

          if @_response.stats
            @_setStats @_response.stats

          @_response.data ?= []
          return @_response unless @_response.data?
          for row in @_response.data
            for node in row.graph.nodes
              @nodes.push node
            for relationship in row.graph.relationships
              @relationships.push relationship

          @_response

        response: -> @_response

        rows: ->
          # TODO: Maybe cache rows
          for entry in @_response.data
            for cell in entry.row
              if not (cell?)
                null
              else if cell.self?
                angular.copy(cell.data)
              else
                angular.copy(cell)

        columns: ->
          @_response.columns

        # Tell wether the result is pure text (ie. no nodes or relations)
        isTextOnly: ->
          @nodes.length is 0 and @relationships.length is 0

        _setStats: (@stats) ->
          return unless @stats?
          if @stats.labels_added > 0 or @stats.labels_removed > 0
            $rootScope.$broadcast 'db:changed:labels', angular.copy(@stats)
      CypherResult
  ]