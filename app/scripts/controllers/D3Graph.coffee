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
  .controller('D3GraphCtrl', [
    '$attrs'
    '$element'
    '$parse'
    '$window'
    '$rootScope'
    '$scope'
    '$interval'
    '$timeout'
    'CircularLayout'
    'GraphExplorer'
    'GraphStyle'
    'Editor'
    ($attrs, $element, $parse, $window, $rootScope, $scope, $interval, $timeout, CircularLayout, GraphExplorer, GraphStyle, Editor) ->
      graphView = null
      @getGraphView = -> return graphView

      measureSize = ->
        width: $element.width()
        height: $element.height()

      attributeHandlerFactory = (attribute) ->
        (item) ->
          if $attrs[attribute]
            exp = $parse($attrs[attribute])
            $scope.$applyAsync( ->exp($scope, {'$item': item }))

      itemMouseOver = attributeHandlerFactory('onItemMouseOver')
      itemMouseOut = attributeHandlerFactory('onItemMouseOut')
      nodeDragToggle = attributeHandlerFactory('onNodeDragToggle')
      onCanvasClicked = attributeHandlerFactory('onCanvasClicked')
      selectItem = attributeHandlerFactory('onItemClick')

      selectedItem = null

      toggleSelection = (d) =>
        if d is selectedItem
          d?.selected = no
          selectedItem = null
        else
          selectedItem?.selected = no
          d?.selected = yes
          selectedItem = d

        graphView.update()
        selectItem(selectedItem)

      closeContextMenuForItem = (d) =>
        if d is selectedItem
          d?.selected = no
          selectedItem = null
        else
          selectedItem?.selected = no
          d?.selected = yes
          selectedItem = d

        graphView.update()
        selectedItem

      $rootScope.$on 'layout.changed', (-> graphView?.resize())

      $rootScope.$on 'close.contextMenu', (->
        closeContextMenuForItem selectedItem
      )

      $scope.$watch 'displayInternalRelationships', (displayInternalRelationships) ->
        $rootScope.stickyDisplayInternalRelationships = displayInternalRelationships
        return unless graphView
        if displayInternalRelationships
          GraphExplorer.internalRelationships(graphView.graph, [], graphView.graph.nodes())
          .then ->
            graphView.update()
        else
          graphView.graph.pruneInternalRelationships()
          graphView.update()

      nodeClicked = (d) ->
        d.fixed = yes
        toggleSelection(d)

      initGraphView = (graph) ->

        getNodeNeigbours = (d) ->
          GraphExplorer.exploreNeighbours(d, graph, $scope.displayInternalRelationships)
          .then(
            # Success
            (neighboursResult) =>
              checkLimitsReached neighboursResult
              linkDistance = 60
              CircularLayout.layout(graph.nodes(), d, linkDistance)
              d.expanded = yes
              graphView.update()
          )

        checkMaxNodesReached graph
        graphView = new neo.graphView($element[0], measureSize, graph, GraphStyle)

        $scope.style = GraphStyle.rules
        $scope.$watch 'style', (val) =>
          return unless val
          graphView.update()
        , true

        graphView
        .on('nodeClicked', (d) ->
          unless d.contextMenuEvent
            nodeClicked d
          d.contextMenuEvent = no
        )
        .on('nodeClose', (d) ->
          d.contextMenuEvent = yes
          GraphExplorer.removeNodesAndRelationships d, graph
          toggleSelection(d)
        )
        .on('nodeUnlock', (d) ->
          d.contextMenuEvent = yes
          d.fixed = no
          toggleSelection(null)
        )
        .on('nodeDblClicked', (d) ->
          d.minified = no
          return if d.expanded
          getNodeNeigbours(d)
          $rootScope.$apply() unless $rootScope.$$phase
        )
        .on('deleteNode', (d) ->
          Editor.setContent "MATCH (n) WHERE id(n) = " + d.id + " DETACH DELETE n"
          $scope.focusEditor()
        ).on('editNode', (d) ->
          Editor.setContent "MATCH (n) WHERE id(n) = " + d.id + " RETURN n"
          $scope.focusEditor()
        )
        .on('relationshipClicked', (d) ->
          toggleSelection(d)
        )
        .on('nodeMouseOver', itemMouseOver)
        .on('nodeMouseOut', itemMouseOut)
        .on('menuMouseOver', itemMouseOver)
        .on('menuMouseOut', itemMouseOut)
        .on('nodeDragToggle', nodeDragToggle)
        .on('relMouseOver', itemMouseOver)
        .on('relMouseOut', itemMouseOut)
        .on('canvasClicked', ->
          toggleSelection(null)
          onCanvasClicked()
        )
        .on('updated', ->
          $rootScope.$broadcast 'graph:changed', graph
        )

        emitStats = ->
          stats = graphView.collectStats()
          if stats.frameCount > 0
            $rootScope.$emit 'visualization:stats', stats

        $interval emitStats, 1000

        graphView.resize()
        $rootScope.$broadcast 'graph:changed', graph

      @render = (initialGraph) ->
        graph = initialGraph
        return if graph.nodes().length is 0
        if $scope.displayInternalRelationships
          GraphExplorer.internalRelationships(graph, [], graph.nodes())
          .then ->
            initGraphView(graph)
        else
          initGraphView(graph)

      checkLimitsReached = (result) ->
        if result.neighbourSize > result.neighbourDisplayedSize
          return $scope.$emit 'graph:max_neighbour_limit', result

      checkMaxNodesReached = (graph) ->
        if graph.display? then $scope.$emit 'graph:initial_node_display_limit', graph.display

      return @
  ])
