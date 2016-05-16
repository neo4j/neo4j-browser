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
  .factory 'CypherTransactionREST', [
    '$q'
    'CypherResult'
    'Server'
    'UsageDataCollectionService'
    'Timer'
    ($q, CypherResult, Server, UDC, Timer) ->
      parseId = (resource = "") ->
        id = resource.split('/').slice(-2, -1)
        return parseInt(id, 10)

      promiseResult = (promise) ->
        q = $q.defer()
        promise.then(
          (r) ->
            raw = {responseTime: r.data.responseTime || 0, request: r.config, response: {headers: r.headers(), data: r.data}}
            raw.request.status = r.status
            if not r
              q.reject({protocol: 'rest', raw: raw})
            else if r.data.errors && r.data.errors.length > 0
              q.reject({protocol: 'rest', errors: r.data.errors, raw: raw})
            else
              results = []
              partResult = new CypherResult(r.data.results[0] || {})
              partResult.protocol = 'rest'
              partResult.raw = raw
              partResult.notifications = r.data.notifications
              results.push partResult
              q.resolve(results[0])
        ,
        (r) ->
          raw = {request: r.config, response: {headers: r.headers(), data: r.data}}
          raw.request.status = r.status
          q.reject({protocol: 'rest', errors: r.data.errors || r.errors, raw: raw})
        )
        q.promise

      class CypherTransactionREST
        constructor: () ->
          @_reset()
          @requests = []
          delegate = null

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
          @id = null

        # TODO: the @id is assigned in a promise, we should probably keep the promise around to do the right thing
        #       if the id hasn't been assigned yet, but the request is still running.
        begin: (query) ->
          statements = if query then [{statement:query}] else []
          rr = Server.transaction(
            path: ""
            statements: statements
          ).success(
            (r) =>
              @id = parseId(r.commit)
              @delegate?.transactionStarted.call(@delegate, @id, @)
              r
          )
          parsed_result = promiseResult rr
          @_requestDone parsed_result
          parsed_result

        execute: (query) ->
          return @begin(query) unless @id
          parsed_result = promiseResult(Server.transaction(
            path: '/' + @id
            statements: [
              statement: query
            ]
          ))
          @_requestDone parsed_result
          parsed_result

        commit: (query) ->
          statements = if query then [{statement:query}] else []
          UDC.increment('cypher_attempts')
          timer = Timer.start()
          if @id
            q = $q.defer()
            rr = Server.transaction(
              path: "/#{@id}/commit"
              statements: statements
            ).success((r) =>
              r.responseTime = timer.stop().time()
              @delegate?.transactionFinished.call(@delegate, @id)
              @_reset()
              q.resolve(r)
            ).error((r) ->
              r.responseTime = timer.stop().time()
              q.reject(r)
            )
            res = promiseResult(rr)
            res.then(
              -> UDC.increment('cypher_wins')
              -> UDC.increment('cypher_fails')
            )
            @_requestDone res
            res
          else
            p = Server.transaction(
              path: "/commit"
              statements: statements
            )
            p.success((r) ->
              r.responseTime = timer.stop().time()
            ).error((r) ->
              r.responseTime = timer.stop().time()
            )
            res = promiseResult p
            res.then(
              -> UDC.increment('cypher_wins')
              -> UDC.increment('cypher_fails')
            )
            @_requestDone res
            res

        rollback: ->
          q = $q.defer()
          if not @id
            q.resolve({})
            return q.promise
          server_promise = Server.transaction(
            method: 'DELETE'
            path: '/' + @id
            statements: []
          )
          server_promise.then(
            (r) =>
              @_reset()
              q.resolve r
            ,
            (r) ->
              q.reject r
          )
          q.promise

      return CypherTransactionREST
  ]