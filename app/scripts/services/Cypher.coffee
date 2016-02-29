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
  .factory 'Cypher', [
    '$q'
    '$rootScope'
    'Server'
    'UsageDataCollectionService'
    'ProtocolFactory'
    ($q, $rootScope, Server, UDC, ProtocolFactory) ->

      class CypherService
        constructor: () ->
          @_active_requests = {}

        profile: (query) ->
          q = $q.defer()
          Server.cypher('?profile=true', {query: query})
          .success((r) -> q.resolve(r.plan))
          .error(q.reject)
          q.promise

        send: (query) -> # Deprecated
          @transaction().commit(query)

        getTransactionIDs: () ->
          Object.keys(@_active_requests)

        transaction: ->
          transaction = ProtocolFactory.getCypherTransaction()
          transaction.delegate = @
          transaction

        transactionStarted: (id, transaction) ->
          @_active_requests[id] = transaction

        transactionFinished: (id) ->
          if @_active_requests[id] != 'undefined'
            delete @_active_requests[id]

        rollbackAllTransactions: () =>
          ids = @getTransactionIDs()
          ids?.forEach (d, i) ->
            @_active_requests[i].rollback()

      window.Cypher = new CypherService()
]
