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

      promiseResult = (promise) ->
        q = $q.defer()
        promise.then(
          (res) =>
            raw = res.original
            remapped = res.remapped
            if not remapped
              q.reject({protocol: 'bolt', raw: raw})
            else if remapped.data.errors && remapped.data.errors.length > 0
              q.reject({protocol: 'bolt', errors: remapped.data.errors, raw: raw})
            else
              results = []
              partResult = new CypherResult(remapped.data.results[0] || {})
              partResult.protocol = 'bolt'
              partResult.raw = raw
              partResult.notifications = remapped.data.notifications
              results.push partResult
              q.resolve(results[0])
        ,
          (res) ->
            remapped = res.remapped
            q.reject({
              protocol: 'bolt',
              raw: res.original,
              errors: remapped.data.errors,
              notifications: remapped.data.notifications
            })
        )
        q.promise

      commit = (query) ->
        statements = if query then [{statement: "CALL " + query}] else []
        q = $q.defer()
        {tx, promise} = Bolt.transaction(statements)
        promise.then((r) -> q.resolve({original: r, remapped: Bolt.constructResult(r)}))
        .catch((r) -> q.reject({original: r, remapped: Bolt.constructResult(r)}))

        res = promiseResult(q.promise)
        res


      fetch: ->
        q = $q.defer()
        x = {}
        commit("db.labels").then(
          (r)-> x.labels = r.raw.records.map (o) -> o['label']
          (r)-> []
        ).then
        commit("db.relationshipTypes").then(
          (r)-> x.relationships = r.raw.records.map (o) -> o['relationshipType']
          (r)-> []
        ).then
        commit("db.propertyKeys").then(
          (r)->
            x.propertyKeys = r.raw.records.map (o) -> o['propertyKey']
            q.resolve(x)
          (r)->
            []
            q.resolve(x)
        )
        q.promise

  ]