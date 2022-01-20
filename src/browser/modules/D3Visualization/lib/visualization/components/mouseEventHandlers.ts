import { D3DragEvent, drag as d3Drag } from 'd3-drag'
import { Simulation } from 'd3-force'
import { BaseType, Selection } from 'd3-selection'
import { ZoomBehavior } from 'd3-zoom'

import {
  DEFAULT_ALPHA,
  DEFAULT_ALPHA_TARGET,
  DRAGGING_ALPHA_TARGET
} from '../constants'
import Relationship from './Relationship'
import VizNode from './VizNode'

export const zoomEventHandler = (
  selection: Selection<SVGGElement, unknown, BaseType, unknown>,
  baseGroup: Selection<SVGGElement, unknown, BaseType, unknown>,
  zoomBehavior: ZoomBehavior<SVGGElement, unknown>
) => {
  const handleZoomOnShiftScroll = (e: WheelEvent) => {
    if (e.shiftKey) {
      e.preventDefault()

      const delta =
        -e.deltaY * (e.deltaMode === 1 ? 0.05 : e.deltaMode ? 1 : 0.002)

      return zoomBehavior.scaleBy(baseGroup, 1 + delta)
    }
  }

  return selection
    .on('dblclick.zoom', null)
    .on('DOMMouseScroll.zoom', handleZoomOnShiftScroll)
    .on('wheel.zoom', handleZoomOnShiftScroll)
    .on('mousewheel.zoom', handleZoomOnShiftScroll)
}

export const nodeEventHandlers = (
  selection: Selection<SVGGElement, VizNode, BaseType, unknown>,
  trigger: (event: string, node: VizNode) => void,
  simulation: Simulation<VizNode, Relationship>
) => {
  let initialDragPosition: [number, number]
  let restartedSimulation = false
  const tolerance = 25

  const onNodeClick = (_event: Event, node: VizNode) => {
    trigger('nodeClicked', node)
  }

  const onNodeDblClick = (_event: Event, node: VizNode) => {
    trigger('nodeDblClicked', node)
  }

  const onNodeMouseOver = (_event: Event, node: VizNode) => {
    if (!node.fx && !node.fy) {
      node.hoverFixed = true
      node.fx = node.x
      node.fy = node.y
    }

    trigger('nodeMouseOver', node)
  }

  const onNodeMouseOut = (_event: Event, node: VizNode) => {
    if (node.hoverFixed) {
      node.hoverFixed = false
      node.fx = null
      node.fy = null
    }

    trigger('nodeMouseOut', node)
  }

  const dragstarted = (event: D3DragEvent<SVGGElement, VizNode, any>) => {
    initialDragPosition = [event.x, event.y]
    restartedSimulation = false
  }

  const dragged = (
    event: D3DragEvent<SVGGElement, VizNode, any>,
    node: VizNode
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
        .alpha(DEFAULT_ALPHA)
        .restart()
      restartedSimulation = true
    }

    node.hoverFixed = false
    node.fx = event.x
    node.fy = event.y
  }

  const dragended = (_event: D3DragEvent<SVGGElement, VizNode, any>) => {
    if (restartedSimulation) {
      // Reset alphaTarget so the simulation cools down and stops.
      simulation.alphaTarget(DEFAULT_ALPHA_TARGET)
    }
  }

  return selection
    .call(
      d3Drag<SVGGElement, VizNode>()
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
  selection: Selection<SVGGElement, Relationship, BaseType, unknown>,
  trigger: (event: string, rel: Relationship) => void
) => {
  const onRelationshipClick = (event: Event, rel: Relationship) => {
    event.stopPropagation()
    trigger('relationshipClicked', rel)
  }

  const onRelMouseOver = (_event: Event, rel: Relationship) => {
    trigger('relMouseOver', rel)
  }

  const onRelMouseOut = (_event: Event, rel: Relationship) => {
    trigger('relMouseOut', rel)
  }

  return selection
    .on('mousedown', onRelationshipClick)
    .on('mouseover', onRelMouseOver)
    .on('mouseout', onRelMouseOut)
}
