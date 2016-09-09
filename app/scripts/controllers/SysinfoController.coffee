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
  .controller 'SysinfoController', [
    '$scope', 'Settings', 'ProtocolFactory', 'Features', '$timeout'
  ($scope, Settings, ProtocolFactory, Features, $timeout) ->
    $scope.autoRefresh = false
    $scope.sysinfo = {}
    $scope.sysinfo.primitives ?= {}
    $scope.sysinfo.cache ?= { available: false }
    $scope.sysinfo.tx ?= { available: false }
    $scope.sysinfo.ha ?= { }
    $scope.refresh = () ->
      # kernel info from JMX
      $scope.sysinfo.kernel ?= {}
      ProtocolFactory.getStoredProcedureService().getJmx(
          ["*:*"]).then((response) ->
            intialResponse = response.data[0]
            jmxQueryPrefix = intialResponse.name.split(',')[0]
            for r in response.data
              if r.name in ["#{jmxQueryPrefix},name=Configuration","#{jmxQueryPrefix},name=Kernel","#{jmxQueryPrefix},name=Store file sizes" ]
                for a in r.attributes
                  $scope.sysinfo.kernel[a.name] = a.value
              else if r.name ==  "#{jmxQueryPrefix},name=Primitive count"
                for a in r.attributes
                  $scope.sysinfo.primitives[a.name] = a.value
              else if r.name == "#{jmxQueryPrefix},name=Page cache"
                $scope.sysinfo.cache.available = true
                for a in r.attributes
                  $scope.sysinfo.cache[a.name] = a.value
              else if r.name == "#{jmxQueryPrefix},name=Transactions"
                $scope.sysinfo.tx.available = true
                for a in r.attributes
                  $scope.sysinfo.tx[a.name] = a.value
              else if r.name == "#{jmxQueryPrefix},name=High Availability"
                $scope.sysinfo.ha.clustered = true
                for a in r.attributes
                  if a.name is "InstancesInCluster"
                    $scope.sysinfo.ha.ClusterMembers = {}
                    for member in a.value
                      clusterMember = {}
                      for ma in member.value
                        clusterMember[ma.name] = ma.value
                      clusterMember.connected = false
                      $scope.sysinfo.ha.ClusterMembers[clusterMember.instanceId] = clusterMember
                  else
                    if a.name is "InstanceId"
                      connectedMemberId = a.value
                    $scope.sysinfo.ha[a.name] = a.value
                $scope.sysinfo.ha.ClusterMembers[connectedMemberId].connected = true
          ).catch((r) ->
            $scope.sysinfo.kernel = {}
            $scope.sysinfo.primitives = {}
            $scope.sysinfo.cache = { available: false }
            $scope.sysinfo.tx = {available: false}
            $scope.sysinfo.ha = { clustered: false })

      if Features.usingCoreEdge
        ProtocolFactory.getStoredProcedureService().getCoreEdgeOverview()
        .then((response) ->
          $scope.sysinfo.ce = response
        )

    timer = null
    refreshLater = () =>
      $timeout.cancel(timer)

      if $scope.autoRefresh
        $scope.refresh()
        timer = $timeout(
          refreshLater
          ,
          (Settings.refreshInterval * 1000)
        )

    $scope.isMaster = (member) ->
      return member.haRole is 'master'

    $scope.toggleAutoRefresh = () ->
      $scope.autoRefresh = !$scope.autoRefresh
      refreshLater()

    $scope.refresh()
]
