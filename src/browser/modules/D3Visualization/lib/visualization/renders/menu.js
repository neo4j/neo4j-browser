/*
 * Copyright (c) 2002-2018 "Neo4j, Inc"
 * Network Engine for Objects in Lund AB [http://neotechnology.com]
 *
 * This file is part of Neo4j.
 *
 * Neo4j is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
/* global d3 */
;(function () {
  const noop = function () {}

  const numberOfItemsInContextMenu = 3

  const arc = function (radius, itemNumber, width) {
    if (width == null) {
      width = 30
    }
    itemNumber = itemNumber - 1
    const startAngle = ((2 * Math.PI) / numberOfItemsInContextMenu) * itemNumber
    const endAngle = startAngle + (2 * Math.PI) / numberOfItemsInContextMenu
    const innerRadius = Math.max(radius + 8, 20)
    return d3.svg
      .arc()
      .innerRadius(innerRadius)
      .outerRadius(innerRadius + width)
      .startAngle(startAngle)
      .endAngle(endAngle)
      .padAngle(0.03)
  }

  const getSelectedNode = function (node) {
    if (node.selected) {
      return [node]
    } else {
      return []
    }
  }

  const attachContextEvent = (event, elems, viz, content, label) =>
    (() => {
      const result = []
      for (let elem of Array.from(elems)) {
        elem.on('mousedown.drag', function () {
          d3.event.stopPropagation()
          return null
        })
        elem.on('mouseup', node => viz.trigger(event, node))
        elem.on('mouseover', function (node) {
          node.contextMenu = {
            menuSelection: event,
            menuContent: content,
            label
          }
          return viz.trigger('menuMouseOver', node)
        })
        result.push(
          elem.on('mouseout', function (node) {
            delete node.contextMenu
            return viz.trigger('menuMouseOut', node)
          })
        )
      }
      return result
    })()

  const createMenuItem = function (
    selection,
    viz,
    eventName,
    itemNumber,
    className,
    position,
    textValue,
    helpValue
  ) {
    const path = selection.selectAll(`path.${className}`).data(getSelectedNode)
    const iconPath = selection
      .selectAll(`.icon.${className}`)
      .data(getSelectedNode)

    const tab = path
      .enter()
      .append('path')
      .classed(className, true)
      .classed('context-menu-item', true)
      .attr({
        d (node) {
          return arc(node.radius, itemNumber, 1)()
        }
      })

    const rawSvgIcon = neo.icons[textValue]
    const icon = iconPath
      .enter()
      .appendSVG(rawSvgIcon)
      .classed(className, true)
      .classed('context-menu-item', true)
      .attr({
        transform (node) {
          return (
            'translate(' +
            Math.floor(
              arc(node.radius, itemNumber).centroid()[0] +
                (position[0] * 100) / 100
            ) +
            ',' +
            Math.floor(
              arc(node.radius, itemNumber).centroid()[1] +
                (position[1] * 100) / 100
            ) +
            ')' +
            ' ' +
            'scale(0.7)'
          )
        },
        color (node) {
          return viz.style.forNode(node).get('text-color-internal')
        }
      })

    attachContextEvent(eventName, [tab, icon], viz, helpValue, rawSvgIcon)

    tab
      .transition()
      .duration(200)
      .attr({
        d (node) {
          return arc(node.radius, itemNumber)()
        }
      })

    path
      .exit()
      .transition()
      .duration(200)
      .attr({
        d (node) {
          return arc(node.radius, itemNumber, 1)()
        }
      })
      .remove()

    return iconPath.exit().remove()
  }

  const donutRemoveNode = new neo.Renderer({
    onGraphChange (selection, viz) {
      return createMenuItem(
        selection,
        viz,
        'nodeClose',
        1,
        'remove_node',
        [-8, 0],
        'Remove',
        'Dismiss'
      )
    },

    onTick: noop
  })

  const donutExpandNode = new neo.Renderer({
    onGraphChange (selection, viz) {
      return createMenuItem(
        selection,
        viz,
        'nodeDblClicked',
        2,
        'expand_node',
        [-8, -10],
        'Expand',
        'Expand child relationships'
      )
    },

    onTick: noop
  })

  const donutUnlockNode = new neo.Renderer({
    onGraphChange (selection, viz) {
      return createMenuItem(
        selection,
        viz,
        'nodeUnlock',
        3,
        'unlock_node',
        [-10, -6],
        'Unlock',
        'Unlock the node to re-layout the graph'
      )
    },

    onTick: noop
  })

  neo.renderers.menu.push(donutExpandNode)
  neo.renderers.menu.push(donutRemoveNode)
  return neo.renderers.menu.push(donutUnlockNode)
})()
