/*
 * Copyright (c) "Neo4j"
 * Neo4j Sweden AB [http://neo4j.com]
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

import d3 from 'd3'
import Node from '../components/Node'
import Renderer from '../components/Renderer'
import { VizObj } from '../components/visualization'
import icons from './d3Icons'

const noOp = () => undefined

const numberOfItemsInContextMenu = 3

const drawArc = function(radius: number, itemNumber: number, width = 30) {
  const startAngle =
    ((2 * Math.PI) / numberOfItemsInContextMenu) * (itemNumber - 1)
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

const getSelectedNode = (node: Node) => (node.selected ? [node] : [])

const attachContextEvent = (
  eventType: string,
  elements: d3.Selection<any>[],
  viz: VizObj,
  content: string,
  label: string
) => {
  elements.forEach(element => {
    element.on('mousedown.drag', () => {
      ;(d3.event as Event).stopPropagation()
      return null
    })
    element.on('mouseup', node => viz.trigger(eventType, node))
    element.on('mouseover', node => {
      node.contextMenu = {
        menuSelection: eventType,
        menuContent: content,
        label
      }
      return viz.trigger('menuMouseOver', node)
    })

    element.on('mouseout', node => {
      delete node.contextMenu
      return viz.trigger('menuMouseOut', node)
    })
  })
}

const createMenuItem = function(
  selection: d3.Selection<any>,
  viz: VizObj,
  eventType: string,
  itemIndex: number,
  className: string,
  position: [number, number],
  svgIconKey: 'Expand / Collapse' | 'Unlock' | 'Remove',
  tooltip: string
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
      d(node: Node) {
        // @ts-expect-error Expected 1-2 arguments, but got 0.ts(2554)
        return drawArc(node.radius, itemIndex, 1)()
      }
    })

  const rawSvgIcon = icons[svgIconKey]
  const svgIcon = document.importNode(
    new DOMParser().parseFromString(rawSvgIcon, 'application/xml')
      .documentElement.firstChild as HTMLElement,
    true
  )
  const icon = iconPath
    .enter()
    .append('g')
    .html(svgIcon.innerHTML)
    .classed('icon', true)
    .classed(className, true)
    .classed('context-menu-item', true)
    .attr({
      transform(node: Node) {
        return `translate(${Math.floor(
          // @ts-expect-error
          drawArc(node.radius, itemIndex).centroid()[0] +
            (position[0] * 100) / 100
        )},${Math.floor(
          // @ts-expect-error
          drawArc(node.radius, itemIndex).centroid()[1] +
            (position[1] * 100) / 100
        )}) scale(0.7)`
      },
      color(node: Node) {
        return viz.style.forNode(node).get('text-color-internal')
      }
    })

  attachContextEvent(eventType, [tab, icon], viz, tooltip, rawSvgIcon)

  tab
    .transition()
    .duration(200)
    .attr({
      d(node: Node) {
        // @ts-expect-error Expected 1-2 arguments, but got 0.ts(2554)
        return drawArc(node.radius, itemIndex)()
      }
    })

  path
    .exit()
    .transition()
    .duration(200)
    .attr({
      d(node: Node) {
        // @ts-expect-error Expected 1-2 arguments, but got 0.ts(2554)
        return drawArc(node.radius, itemIndex, 1)()
      }
    })
    .remove()

  return iconPath.exit().remove()
}

const donutRemoveNode = new Renderer({
  onGraphChange(selection, viz) {
    return createMenuItem(
      selection,
      viz,
      'nodeClose',
      1,
      'remove-node',
      [-8, 0],
      'Remove',
      'Dismiss'
    )
  },

  onTick: noOp
})

const donutExpandNode = new Renderer({
  onGraphChange(selection, viz) {
    return createMenuItem(
      selection,
      viz,
      'nodeDblClicked',
      2,
      'expand-node',
      [-8, -10],
      'Expand / Collapse',
      'Expand / Collapse child relationships'
    )
  },

  onTick: noOp
})

const donutUnlockNode = new Renderer({
  onGraphChange(selection, viz) {
    return createMenuItem(
      selection,
      viz,
      'nodeUnlock',
      3,
      'unlock-node',
      [-10, -6],
      'Unlock',
      'Unlock the node to re-layout the graph'
    )
  },

  onTick: noOp
})

export const nodeMenuRenderer = [
  donutExpandNode,
  donutRemoveNode,
  donutUnlockNode
]
