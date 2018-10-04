###!
Copyright (c) 2002-2015 "Neo4j, Inc,"
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

do ->
  noop = ->

  numberOfItemsInContextMenu = 3

  arc = (radius, itemNumber, width = 30) ->
    itemNumber = itemNumber - 1
    startAngle = ((2*Math.PI)/numberOfItemsInContextMenu) * itemNumber
    endAngle = startAngle + ((2*Math.PI)/numberOfItemsInContextMenu)
    innerRadius = Math.max(radius + 8, 20)
    d3.svg.arc().innerRadius(innerRadius).outerRadius(innerRadius + width).startAngle(startAngle).endAngle(endAngle).padAngle(.03)

  getSelectedNode = (node) -> if node.selected then [node] else []

  attachContextEvent = (event, elems, viz, content, label) ->
    for elem in elems
      elem.on('mousedown.drag', ->
        d3.event.stopPropagation()
        null)
      elem.on('mouseup', (node) ->
        viz.trigger(event, node))
      elem.on('mouseover', (node) ->
        node.contextMenu =
          menuSelection: event
          menuContent: content
          label: label
        viz.trigger('menuMouseOver', node))
      elem.on('mouseout', (node) ->
        delete node.contextMenu
        viz.trigger('menuMouseOut', node))

  createMenuItem = (selection, viz, eventName, itemNumber, className, position, textValue, helpValue) ->
    path = selection.selectAll('path.' + className).data(getSelectedNode)
    iconPath = selection.selectAll('.icon.' + className).data(getSelectedNode)

    tab = path.enter()
    .append('path')
    .classed(className, true)
    .classed('context-menu-item', true)
    .attr
        d: (node) -> arc(node.radius, itemNumber, 1)()

    rawSvgIcon = neo.icons[textValue]
    icon = iconPath
    .enter()
    .appendSVG(rawSvgIcon)
    .classed(className, true)
    .classed('context-menu-item', true)
    .attr
        transform: (node) ->
          'translate(' +
          Math.floor(arc(node.radius, itemNumber).centroid()[0] + position[0] * 100 / 100) + ',' +
          Math.floor(arc(node.radius, itemNumber).centroid()[1] + position[1] * 100 / 100) + ')' + ' ' +
          'scale(0.7)'
        color: (node) -> viz.style.forNode(node).get('text-color-internal')

    attachContextEvent(eventName, [tab, icon], viz, helpValue, rawSvgIcon)

    tab
    .transition()
    .duration(200)
    .attr
        d: (node) -> arc(node.radius, itemNumber)()

    path
    .exit()
    .transition()
    .duration(200)
    .attr
        d: (node) -> arc(node.radius, itemNumber, 1)()
    .remove()

    iconPath
    .exit()
    .remove()

  donutRemoveNode = new neo.Renderer(
    onGraphChange: (selection, viz) -> createMenuItem(selection, viz, 'nodeClose', 1, 'remove_node', [-8, 0], 'Remove', 'Dismiss')

    onTick: noop
  )

  donutExpandNode = new neo.Renderer(
    onGraphChange: (selection, viz) -> createMenuItem(selection, viz, 'nodeDblClicked', 2, 'expand_node', [-8, -10], 'Expand', 'Expand child relationships')

    onTick: noop
  )

  donutUnlockNode = new neo.Renderer(
    onGraphChange: (selection, viz) -> createMenuItem(selection, viz, 'nodeUnlock', 3, 'unlock_node', [-10, -6], 'Unlock', 'Unlock the node to re-layout the graph')

    onTick: noop
  )

  neo.renderers.menu.push(donutExpandNode)
  neo.renderers.menu.push(donutRemoveNode)
  neo.renderers.menu.push(donutUnlockNode)
