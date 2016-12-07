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
  .controller 'CypherResultCtrl', ['$rootScope', '$scope', 'AsciiTableFactory', 'BoltIntHelpers', 'Settings', ($rootScope, $scope, AsciiTableFactory, BoltIntHelpers, Settings) ->
    $scope.displayInternalRelationships = Settings.autoComplete
    initializing = yes
    $scope.availableModes = []
    $scope.slider = {min: 4, max: 20}
    asciiTable = AsciiTableFactory.getInstance()
    $scope.ascii = ''
    $scope.ascii_col_width = 30
    tableData = []

    $scope.$watch 'frame.response', (resp, old) ->
      return unless resp
      $scope.availableModes = []
      if not resp.errors
        $scope.availableModes.push('graph') if resp.graph?._nodes.length
        $scope.availableModes.push('table') if resp.table?.size?
        $scope.availableModes.push('plan') if resp.table?._response.plan
      $scope.availableModes.push('raw') if resp.raw
      $scope.availableModes.push('errors') if resp.errors
      $scope.availableModes.push('messages') if resp.notifications?.length
      $scope.availableModes.push('text') if resp.table?.size
      tableData = resp.table._response if resp.table?._response.data.length

      # Initialise tab state from user selected if any
      $scope.tab = $rootScope.stickyTab

      # Always pre-select the plan -> errors tab if available
      if $scope.isAvailable('messages') and $scope.frame.showCypherNotification
        $scope.tab = 'messages'
      else if $scope.isAvailable 'plan'
        $scope.tab = 'plan'
      else if $scope.isAvailable 'errors'
        $scope.tab = 'errors'

      # Otherwise try to detect the best mode
      if not $scope.tab?
        $scope.tab = $scope.availableModes[0] || 'table'

      # Override user tab selection if that mode doesn't exists
      $scope.tab = 'table' unless $scope.availableModes.indexOf($scope.tab) >= 0

    $scope.loadAscii = () ->
      return if not tableData or not tableData.data
      if not asciiTable.serializedItems
        rows = tableData.data.map((data_obj) -> return BoltIntHelpers.mapBoltIntsToStrings(data_obj.row))
        rows.splice(0, 0, tableData.columns)
        asciiTable.setData rows
      res = asciiTable.getFromSerializedData($scope.ascii_col_width)
      $scope.slider.max = asciiTable.maxWidth
      $scope.ascii = res
      initializing = no

    $scope.$watch('ascii_col_width', (n, o) ->
      unless initializing then $scope.loadAscii()
    )

    $scope.setActive = (tab) ->
      tab ?= if $scope.tab is 'graph' then 'table' else 'graph'
      if tab is 'text' and tab isnt $scope.tab then $scope.loadAscii()
      $rootScope.stickyTab = $scope.tab = tab

    $scope.isActive = (tab) ->
      active = tab is $scope.tab
      if initializing and active and $scope.tab is 'text' then $scope.loadAscii()
      active

    $scope.isAvailable = (tab) ->
      tab in $scope.availableModes

    $scope.resultStatistics = (frame) ->
      if frame?.response
        updatesMessages = []
        if frame.response and expectRecords frame
          updatesMessages = $scope.updatesStatistics frame
        rowsStatistics = $scope.returnedRowsStatistics frame
        messages = [].concat(updatesMessages, rowsStatistics)
        $scope.formatStatisticsOutput messages

    $scope.graphStatistics = (frame) ->
      if frame?.response?.graph?
        graph = frame.response.graph
        plural = (collection, noun) ->
          "#{collection.length} #{noun}#{if collection.length is 1 then '' else 's'}"
        message = "Displaying #{plural(graph.nodes(), 'node')}, #{plural(graph.relationships(), 'relationship')}"
        internalRelationships = graph.relationships().filter((r) -> r.internal)
        if internalRelationships.length > 0
          message += " (completed with  #{plural(internalRelationships, 'additional relationship')})"
        message + '.'

    $scope.planStatistics = (frame) ->
      if frame?.response?.table?._response.plan?
        root = frame.response.table._response.plan.root
        collectHits = (operator) ->
          hits = operator.DbHits ? 0
          if operator.children
            for child in operator.children
              hits += collectHits(child)
          hits

        message = "Cypher version: #{root.version}, planner: #{root.planner}, runtime: #{root.runtime}."
        numHits = collectHits(root)
        if numHits
          message += " #{numHits} total db #{getHitsString numHits} in #{frame.response.timings.resultAvailableAfter || frame.response.timings.responseTime || 0} ms."
        message

    $scope.formatStatisticsOutput = (messages) ->
      joinedMessages = messages.join(', ')
      "#{joinedMessages.substring(0, 1).toUpperCase()}#{joinedMessages.substring(1)}."

    $scope.returnedRowsStatistics = (frame) ->
      messages = []
      if frame?.response?.table?
        messages = getTimeString frame, 'returnedRows'
        if (frame.response.table.size > frame.response.table.displayedSize)
          messages.push "displaying first #{frame.response.table.displayedSize} rows"
      messages

    $scope.updatesStatistics = (frame) ->
      return [] unless haveUpdates frame
      messages = []
      if frame?.response?.table?
        stats = frame.response.table.stats
        nonZeroFields = $scope.getNonZeroStatisticsFields frame
        messages = ("#{field.verb} #{stats[field.field]} #{if stats[field.field] is 1 then field.singular else field.plural}" for field in nonZeroFields)
        timeString = getTimeString frame, 'updates'
        messages = if messages.length then [].concat(messages, timeString) else timeString
      messages

    $scope.getNonZeroStatisticsFields = (frame) ->
      nonZeroFields = []
      if frame?.response?.table?
        stats = frame.response.table.stats
        fields = [
          {plural: 'constraints', singular: 'constraint', verb: 'added', field: 'constraints_added' }
          {plural: 'constraints', singular: 'constraint', verb: 'removed', field: 'constraints_removed' }
          {plural: 'indexes', singular: 'index', verb: 'added', field: 'indexes_added' }
          {plural: 'indexes', singular: 'index', verb: 'removed', field: 'indexes_removed' }
          {plural: 'labels', singular: 'label', verb: 'added', field: 'labels_added' }
          {plural: 'labels', singular: 'label', verb: 'removed', field: 'labels_removed' }
          {plural: 'nodes', singular: 'node', verb: 'created', field: 'nodes_created' }
          {plural: 'nodes', singular: 'node', verb: 'deleted', field: 'nodes_deleted' }
          {plural: 'properties', singular: 'property', verb: 'set', field: 'properties_set' }
          {plural: 'relationships', singular: 'relationship', verb: 'deleted', field: 'relationship_deleted' }
          {plural: 'relationships', singular: 'relationship', verb: 'deleted', field: 'relationships_deleted' }
          {plural: 'relationships', singular: 'relationship', verb: 'created', field: 'relationships_created' }
        ]
        nonZeroFields.push(field) for field in fields when stats[field.field] > 0
      nonZeroFields

    $scope.rawStatistics = (frame) ->
      return unless frame.response?.timings
      if frame.response.timings.type is 'client'
        return "Request completed in #{frame.response.timings.responseTime} ms."
      $scope.formatStatisticsOutput getTimeString frame, 'raw'

    $scope.getRequestTitle = (num_requests, index) ->
      titles = [
        ['Autocommitting Transaction'],
        ['Open Transaction', 'Commit Transaction']
      ]
      titles[num_requests-1][index]

    getRecordString = (num) -> if num is 1 then 'record' else 'records'
    getHitsString = (num) -> if num is 1 then 'hit' else 'hits'
    getReturnString = (num) -> "returned #{num} #{getRecordString(num)}"

    getTimeString = (frame, context) ->
      messages = []
      return getBoltStatusMessage(frame, context) if frame.response.timings.type is 'bolt'
      timeMessage = " in #{frame.response.timings.responseTime} ms"
      if context is 'updates'
        messages.push(getReturnString(frame.response.table.size))
        if not expectRecords(frame)
          messages[messages.length - 1] = "statement completed"
        messages[messages.length - 1] += timeMessage
      if context is 'returnedRows'
        if expectRecords(frame) and not haveUpdates(frame)
          messages.push(getReturnString(frame.response.table.size))
          messages[messages.length - 1] += timeMessage
      messages

    getBoltStatusMessage = (frame, context) ->
      if context is 'updates' and haveUpdates frame
        messages = []
        if not expectRecords frame
          messages.push "statement completed"
        messages[messages.length - 1] += " in #{frame.response.timings.resultAvailableAfter} ms"
        return messages
      else if ['returnedRows', 'raw'].indexOf(context) > -1
        if expectRecords(frame) and haveRecords(frame) # records returned
          statusMessage = "started streaming #{frame.response.table.size} #{getRecordString(frame.response.table.size)} " +
                          "after #{frame.response.timings.resultAvailableAfter} ms " +
                          "and completed after #{frame.response.timings.totalTime} ms"
        else if expectRecords frame # No hits
          statusMessage = "returned #{frame.response.table.size} #{getRecordString(frame.response.table.size)}, " +
                        "completed after #{frame.response.timings.resultAvailableAfter} ms"
        else # No return statement
          statusMessage = "completed after #{frame.response.timings.resultAvailableAfter} ms"
        return [statusMessage]
      return []

    expectRecords = (frame) -> # Did we return something
      frame.response?.table?._response.columns?.length
    haveRecords = (frame) ->
      frame.response.table.size > 0
    haveUpdates = (frame) ->
      $scope.getNonZeroStatisticsFields(frame).length

    # Listen for export events bubbling up the controller hierarchy
    # and forward them down to the child controller that has access to
    # the required SVG elements.
    $scope.$on('frame.export.graph.svg', ->
      $scope.$broadcast('export.graph.svg')
    )

    $scope.$on('frame.export.plan.svg', ->
      $scope.$broadcast('export.plan.svg')
    )

    $scope.$on('frame.export.graph.png', ->
      $scope.$broadcast('export.graph.png')
    )

    $scope.$on('frame.export.plan.png', ->
      $scope.$broadcast('export.plan.png')
    )

    $scope.toggleDisplayInternalRelationships = ->
      $scope.displayInternalRelationships = !$scope.displayInternalRelationships

    $scope.$on 'graph:max_neighbour_limit', (event, result) ->
      if event.stopPropagation then event.stopPropagation()
      $scope.$broadcast 'frame.notif.max_neighbour_limit', result

    $scope.$on 'graph:initial_node_display_limit', (event, result) ->
      if event.stopPropagation then event.stopPropagation()
      $scope.$broadcast 'frame.notif.initial_node_display_limit', result

  ]
