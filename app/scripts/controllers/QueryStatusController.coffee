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
  .controller 'QueryStatusCtrl', [
    '$scope'
    'ProtocolFactory'
    'Settings'
    'Features'
    'Utils'
    '$timeout'
    ($scope, ProtocolFactory, Settings, Features, Utils, $timeout) ->
      $scope.queries = []
      $scope.isFetching = no
      $scope.autoRefresh = no
      $scope.hasErrors = no
      cluster = []
      refreshInterval = 20 #seconds
      maxRows = Settings.maxRows
      maxRowsHit = no
      numQueries = 0
      numQueriesShown = 0
      queryLengthLimit = 180
      convertToJSON = ['parameters', 'metaData']
      timer = null

      $scope.killQuery = (clusterMember, queryId) ->
        removeFromQueryList queryId # Optimistic to give instant feedback to user
        ProtocolFactory.utils().killQuery(clusterMember, queryId)
          .then((r) ->
            $timeout(
              -> checkRunningQueriesInCluster(cluster)
              ,
              500
            )
          )

      $scope.statusMessage = () ->
        _msgs = []
        if $scope.hasErrors
          _msgs.push('Connecting to one or more cluster servers failed')
        _clusterSize = cluster.length
        _numMachinesMsg = "running on one server"
        if _clusterSize > 1
          _numMachinesMsg = "running on #{_clusterSize} cluster servers"
        _numQueriesMsg = if numQueries > 1 then "queries" else "query"
        if maxRowsHit
          _msgs.push "Found #{numQueries} #{_numQueriesMsg} #{_numMachinesMsg}, but displaying #{numQueriesShown} of those due to config maxRows"
        else
          _msgs.push("Found #{numQueriesShown} #{_numQueriesMsg} #{_numMachinesMsg}")
        _msgs.join('. ')

      $scope.toggleAutoRefresh = () ->
        $scope.autoRefresh = !$scope.autoRefresh
        $scope.refreshLater()

      $scope.refreshLater = () =>
        $timeout.cancel(timer)
        checkCluster()
        if $scope.autoRefresh
          timer = $timeout(
            $scope.refreshLater
            ,
            (refreshInterval * 1000)
          )

      $scope.$on '$destroy', () => $timeout.cancel(timer)

      checkCluster = () ->
        mapAddressesFromResponse = (result) -> result.map((_c) ->
            _protocolAddress = ProtocolFactory.utils().getServerAddress(_c.addresses)
            _c.address = _protocolAddress?[0]
            return _c
          ).filter((_c) -> _c.address)
        $scope.isFetching = yes

        if Features.usingCoreEdge
          ProtocolFactory.utils().getClusterOverview()
            .then((r) ->
              cluster = mapAddressesFromResponse r
              checkRunningQueriesInCluster cluster
            ).catch((_e) ->
              console.log _e
              $scope.isFetching = no
            )
        else
          cluster = mapAddressesFromResponse Utils.fakeSingleInstanceCluster null, ProtocolFactory.utils().getHost, 'bolt'
          checkRunningQueriesInCluster cluster

      checkRunningQueriesInCluster = (cluster) ->
        $scope.hasErrors = no
        ProtocolFactory.utils().getRunningQueries(cluster)
          .then((_resArr) ->
            _resArr = _resArr.reduce((_all, _r, _clusterMemberIndex) ->
              if not _r
                $scope.hasErrors = yes
                return _all
              _r.data.results[0].data.forEach((_member) ->
                _tmp = {}
                _member.row.forEach((_col, i) ->
                  _col = JSON.stringify(_col) if convertToJSON.indexOf(_r.data.results[0].columns[i]) > -1
                  _suffix = if _col.length > queryLengthLimit then '...' else ''
                  _tmp[_r.data.results[0].columns[i]] = _col.substring(0, queryLengthLimit) + _suffix
                )
                _tmp.clusterMember = cluster[_clusterMemberIndex]
                _all.push(_tmp)
              )
              return _all
            , [])
            _sortArr = _resArr.map((query, i) -> {index: i, sortVal: "#{query.clusterMember.address}#{query.elapsedTime}"})
            _sortArr.sort((a, b) ->
              if a.sortVal < b.sortVal
                return -1
              return 1
            )
            _outQueries = _sortArr.map((el) -> _resArr[el.index])
            _resArr = null
            numQueries = _outQueries.length
            maxRowsHit = if numQueries > maxRows then yes else no
            numQueriesShown = if maxRowsHit then maxRows else numQueries
            $scope.isFetching = no
            $scope.queries = if maxRowsHit then _outQueries.slice(0, numQueriesShown) else _outQueries
            _outQueries = null
          )
          .catch((e) ->
            console.log e
            $scope.isFetching = no
          )

      removeFromQueryList = (queryId) ->
        $scope.queries = $scope.queries.filter((query) -> query.queryId isnt queryId)

      # Run on mount
      checkCluster()
  ]
