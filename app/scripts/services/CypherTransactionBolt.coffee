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
    'Timer'
    '$rootScope'
    ($q, CypherResult, Bolt, UDC, Timer, $rootScope) ->
      parseId = (resource = "") ->
        id = resource.split('/').slice(-2, -1)
        return parseInt(id, 10)

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

      class CypherTransactionBolt
        constructor: () ->
          @_reset()
          @requests = []
          delegate = null
          @session = null
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
          @session = null

        begin: () ->
          q = $q.defer()
          q.resolve()
          q.promise

        commit: (query, params = null) ->
          that = @
          statements = if query then [{statement:query, parameters: params}] else []
          UDC.increment('cypher_attempts')
          q = $q.defer()
          {tx, promise, session} = Bolt.transaction(statements, @session, @tx)
          @tx = tx
          @session = session
          timer = Timer.start()
          promise.then((r) ->
            $rootScope.bolt_connection_failure = no
            r.responseTime = timer.stop().time()
            q.resolve({original: r, remapped: Bolt.constructResult(r)})
            that._reset()
          ).catch((r) ->
            errObj = Bolt.constructResult(r)
            if errObj.data.errors[0].code is 'Socket.Error' || errObj.data.errors[0].message.indexOf('WebSocket connection failure') == 0
              $rootScope.bolt_connection_failure = yes
            r.responseTime = timer.stop().time()
            q.reject({original: r, remapped: errObj})
            that._reset()
          )
          res = promiseResult(q.promise)
          res.then(
            -> UDC.increment('cypher_wins')
            -> UDC.increment('cypher_fails')
          )
          @_requestDone res
          res

        rollback: ->
          q = $q.defer()
          that = @
          if @session
            @session.close( ->
              that._reset()
              q.resolve({original: {}, remapped: Bolt.constructResult({})})
            )
          else
            q.resolve({original: {}, remapped: Bolt.constructResult({})})
          promiseResult(q.promise)

      return CypherTransactionBolt
  ]
