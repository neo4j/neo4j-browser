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
import { D3DragEvent, drag as d3Drag } from 'd3-drag'
import { Simulation } from 'd3-force'
import { BaseType, Selection } from 'd3-selection'

import {
  DEFAULT_ALPHA_TARGET,
  DRAGGING_ALPHA,
  DRAGGING_ALPHA_TARGET
} from '../../../constants'
import { NodeModel } from '../../../models/Node'
import { RelationshipModel } from '../../../models/Relationship'

export const nodeEventHandlers = (
  selection: Selection<SVGGElement, NodeModel, BaseType, unknown>,
  trigger: (event: string, node: NodeModel) => void,
  simulation: Simulation<NodeModel, RelationshipModel>
) => {
  let initialDragPosition: [number, number]
  let restartedSimulation = false
  const tolerance = 25

  const onNodeClick = (_event: Event, node: NodeModel) => {
    trigger('nodeClicked', node)
  }

  const onNodeDblClick = (_event: Event, node: NodeModel) => {
    trigger('nodeDblClicked', node)
  }

  const onNodeMouseOver = (_event: Event, node: NodeModel) => {
    if (!node.fx && !node.fy) {
      node.hoverFixed = true
      node.fx = node.x
      node.fy = node.y
    }

    trigger('nodeMouseOver', node)
  }

  const onNodeMouseOut = (_event: Event, node: NodeModel) => {
    if (node.hoverFixed) {
      node.hoverFixed = false
      node.fx = null
      node.fy = null
    }

    trigger('nodeMouseOut', node)
  }

  const dragstarted = (event: D3DragEvent<SVGGElement, NodeModel, any>) => {
    initialDragPosition = [event.x, event.y]
    restartedSimulation = false
  }

  const dragged = (
    event: D3DragEvent<SVGGElement, NodeModel, any>,
    node: NodeModel
  ) => {
    // Math.sqrt was removed to avoid unnecessary computation, since this
    // function is called very often when dragging.
    const dist =
      Math.pow(initialDragPosition[0] - event.x, 2) +
      Math.pow(initialDragPosition[1] - event.y, 2)

    // This is to prevent clicks/double clicks from restarting the simulation
    if (dist > tolerance && !restartedSimulation) {
      // Set alphaTarget to a value higher than alphaMin so the simulation
      // isn't stopped while nodes are being dragged.
      simulation
        .alphaTarget(DRAGGING_ALPHA_TARGET)
        .alpha(DRAGGING_ALPHA)
        .restart()
      restartedSimulation = true
    }

    node.hoverFixed = false
    node.fx = event.x
    node.fy = event.y
  }

  const dragended = (_event: D3DragEvent<SVGGElement, NodeModel, any>) => {
    if (restartedSimulation) {
      // Reset alphaTarget so the simulation cools down and stops.
      simulation.alphaTarget(DEFAULT_ALPHA_TARGET)
    }
  }

  return selection
    .call(
      d3Drag<SVGGElement, NodeModel>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended)
    )
    .on('mouseover', onNodeMouseOver)
    .on('mouseout', onNodeMouseOut)
    .on('click', onNodeClick)
    .on('dblclick', onNodeDblClick)
}

export const relationshipEventHandlers = (
  selection: Selection<SVGGElement, RelationshipModel, BaseType, unknown>,
  trigger: (event: string, rel: RelationshipModel) => void
) => {
  const onRelationshipClick = (event: Event, rel: RelationshipModel) => {
    event.stopPropagation()
    trigger('relationshipClicked', rel)
  }

  const onRelMouseOver = (_event: Event, rel: RelationshipModel) => {
    trigger('relMouseOver', rel)
  }

  const onRelMouseOut = (_event: Event, rel: RelationshipModel) => {
    trigger('relMouseOut', rel)
  }

  return selection
    .on('mousedown', onRelationshipClick)
    .on('mouseover', onRelMouseOver)
    .on('mouseout', onRelMouseOut)
}
