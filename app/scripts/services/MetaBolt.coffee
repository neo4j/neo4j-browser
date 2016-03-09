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
  .factory 'MetaBolt', [
    '$q'
    'CypherResult'
    'Bolt'
    ($q, CypherResult, Bolt) ->

      commit = (query) ->
        statements = if query then [{statement: "CALL " + query}] else []
        {tx, promise} = Bolt.transaction(statements)

        q = $q.defer()
        promise.then(
          (res) =>
            q.resolve(res.records)
        ,
          (res) ->
            q.reject({
              protocol: 'bolt',
              raw: res
            })
        )
        q.promise


      fetch: ->
        q = $q.defer()
        metaData = {}
        $q.all([
          commit("db.labels"),
          commit("db.relationshipTypes"),
          commit("db.propertyKeys")
        ]).then((data) ->
          metaData.labels = data[0].map (o) -> o.label
          metaData.relationships = data[1].map (o) -> o.relationshipType
          metaData.propertyKeys =  data[2].map (o) -> o.propertyKey
          q.resolve(metaData)
        )
        q.promise

  ]