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
  .factory 'CypherTransactionBolt', [
    '$q'
    'CypherResult'
    'Bolt'
    'UsageDataCollectionService'
    ($q, CypherResult, Bolt, UDC) ->
      parseId = (resource = "") ->
        id = resource.split('/').slice(-2, -1)
        return parseInt(id, 10)

      promiseResult = (promise) ->
        q = $q.defer()
        promise.then(
          (r) =>
            raw = no
            if not r
              q.reject({raw: raw})
            else if r.data.errors && r.data.errors.length > 0
              q.reject({errors: r.data.errors, raw: raw})
            else
              results = []
              partResult = new CypherResult(r.data.results[0] || {})
              partResult.raw = raw
              partResult.notifications = r.data.notifications
              results.push partResult
              q.resolve(results[0])
        ,
        (r) ->
          q.reject({errors: r.data.errors})
        )
        q.promise

      class CypherTransactionBolt
        constructor: () ->
          @_reset()
          @requests = []
          delegate = null
          @tx = null

        _requestDone: (promise) ->
          that = @
          promise.then(
            (res) ->
              that.requests.push res
            (res) ->
              that.requests.push res
          )

        _onSuccess: () ->

        _onError: () ->

        _reset: ->
          @tx = null

        begin: (query) ->
          q = $q.defer()
          statements = if query then [{statement:query}] else []
          {tx, promise} = Bolt.beginTransaction(statements: statements)
          @tx = tx
          q.resolve()
          q.promise
          
        commit: (query) ->
          statements = if query then [{statement:query}] else []
          UDC.increment('cypher_attempts')
          q = $q.defer()
          {tx, promise} = Bolt.transaction(statements, @tx)
          @tx = tx
          promise.then((r) -> q.resolve(Bolt.constructResult r))
            .catch((r) -> q.reject Bolt.constructResult r)

          res = promiseResult(q.promise)
          res.then(
            -> UDC.increment('cypher_wins')
            -> UDC.increment('cypher_fails')
          )
          @_requestDone res
          res

        rollback: ->
          q = $q.defer()
          @tx.rollback()
          @_reset()
          q.resolve {}
          q.promise

      return CypherTransactionBolt
  ]