import { D3DragEvent, DragBehavior, drag } from 'd3-drag'
import { select } from 'd3-selection'
import { uniqBy } from 'lodash-es'
import { Viewport } from 'pixi-viewport'
import {
  Application,
  Container,
  DisplayObject,
  InteractionEvent,
  InteractionManager,
  Point
} from 'pixi.js'

import ForceSimulation from '../forceSimulation/ForceSimulation'
import { GraphModel } from '../models/Graph'
import { NodeModel } from '../models/Node'
import { GraphChangeHandler } from '../types'
import { mapNodes, mapRelationships } from '../utils/mapper'
import ExternalEventHandler from './ExternalEventHandler'

const tolerance = 25

const dragHandler = <E extends HTMLCanvasElement>(
  dragstartedCallback: () => void,
  draggedCallback: (event: D3DragEvent<E, NodeModel, NodeModel>) => void,
  dragendedCallback: () => void
): DragBehavior<E, NodeModel, NodeModel | null> => {
  function dragstarted() {
    console.log('start')
    dragstartedCallback()
  }

  function dragged(event: D3DragEvent<E, NodeModel, NodeModel>) {
    console.log('dragging')
    if (event.subject) {
      // event.subject.fx = event.x
      // event.subject.fy = event.y
      draggedCallback(event)
    }
  }

  function dragended() {
    console.log('end')
    dragendedCallback()
  }

  return drag<E, NodeModel, NodeModel | null>()
    .on('start', dragstarted)
    .on('drag', dragged)
    .on('end', dragended)
}

class EventHandler {
  private _app: Application
  private _viewport: Viewport
  private _interactionManager: InteractionManager
  private _graph: GraphModel
  private _forceSimulation: ForceSimulation
  private _nodeGfxToNodeData: WeakMap<DisplayObject, string>
  private _clickedNode: NodeModel | null
  private _dblClickNodeTimeout: number | null
  private _isDblClickNode: boolean
  private _render: (nodeId: string) => void
  private _onGraphChange: GraphChangeHandler
  private _bindD3Handler = false
  private _externalEventHandler: ExternalEventHandler

  constructor({
    app,
    viewport,
    interactionManager,
    graph,
    forceSimulation: simulation,
    nodeShapeGfxToNodeData,
    render,
    onGraphChange,
    shouldBindD3DragHandler,
    externalEventHandler
  }: {
    app: Application
    viewport: Viewport
    interactionManager: InteractionManager
    graph: GraphModel
    forceSimulation: ForceSimulation
    nodeShapeGfxToNodeData: WeakMap<Container, string>
    render: (nodeId?: string) => void
    onGraphChange: GraphChangeHandler
    shouldBindD3DragHandler: boolean
    externalEventHandler: ExternalEventHandler
  }) {
    this._app = app
    this._viewport = viewport
    this._interactionManager = interactionManager
    this._graph = graph
    this._forceSimulation = simulation
    this._nodeGfxToNodeData = nodeShapeGfxToNodeData
    this._clickedNode = null
    this._dblClickNodeTimeout = null
    this._isDblClickNode = false
    this._render = render
    this._onGraphChange = onGraphChange
    if (shouldBindD3DragHandler) {
      this._bindD3Handler = shouldBindD3DragHandler
      this.bindD3DragHandler()
    }
    this._externalEventHandler = externalEventHandler
  }

  hoverNode(node: NodeModel): void {
    console.log('hover', node)
    this._externalEventHandler.onItemMouseOver({
      type: 'node',
      item: this._clickedNode ?? node
    })
  }

  bindNodeHoverEvent(nodeGfx: Container): void {
    nodeGfx.on('mouseover', (event: InteractionEvent) =>
      this.hoverNode(
        this._graph.findNodeById(
          this._nodeGfxToNodeData.get(event.currentTarget) as string
        ) as NodeModel
      )
    )
  }

  unHoverNode(): void {
    const nodeCount = this._graph.getNodes().length
    const relationshipCount = this._graph.getRelationships().length
    console.log(nodeCount, relationshipCount)
    this._externalEventHandler.onItemMouseOver({
      type: 'canvas',
      item: { nodeCount, relationshipCount }
    })
  }

  bindNodeUnHoverEvent(nodeGfx: Container): void {
    nodeGfx.on('mouseout', () => this.unHoverNode())
  }

  bindD3DragHandler(): void {
    let initialDragPosition: [number, number]
    let restartedSimulation = false

    select<HTMLCanvasElement, NodeModel>(this._app.renderer.view).call(
      dragHandler(
        () => {
          this._viewport.pause = true
          const worldPosition = this._viewport.toWorld(
            this._interactionManager.eventData.data.global
          )
          initialDragPosition = [worldPosition.x, worldPosition.y]
          restartedSimulation = false
        },
        event => {
          if (this._clickedNode && event.subject) {
            if (this._interactionManager.eventData.type === 'mousemove') {
              const newPosition = this._viewport.toWorld(
                this._interactionManager.eventData.data.global
              )
              // Math.sqrt was removed to avoid unnecessary computation, since this
              // function is called very often when dragging.
              const dist =
                Math.pow(initialDragPosition[0] - newPosition.x, 2) +
                Math.pow(initialDragPosition[1] - newPosition.y, 2)
              if (dist > tolerance && !restartedSimulation) {
                // Set alphaTarget to a value higher than alphaMin so the simulation
                // isn't stopped while nodes are being dragged.
                this._forceSimulation.simulateNodeDrag()
                restartedSimulation = true
              }
              event.subject.fx = newPosition.x
              event.subject.fy = newPosition.y
            }
          }
        },
        () => {
          if (restartedSimulation) {
            // Reset alphaTarget so the simulation cools down and stops.
            this._forceSimulation.stopSimulateNodeDrag()
            this._viewport.pause = false
          }
        }
      )
        .container(this._app.renderer.view)
        .subject(() => this._clickedNode)
    )
  }

  moveNode(node: NodeModel, point: Point): void {
    console.log(point.x, point.y, this._clickedNode)

    node.x = point.x
    node.y = point.y
    // Make sure node position won't be changed when restart simulation
    node.fx = point.x
    node.fy = point.y

    this._render(node.id)
  }

  appMouseMove(event: InteractionEvent): void {
    // console.log(this._clickedNode)
    if (!this._clickedNode) {
      return
    }

    console.log('moving', event)
    // If the drag event is handled by D3Drag, we don't do duplicated re-render
    !this._bindD3Handler &&
      this.moveNode(
        this._clickedNode,
        this._viewport.toWorld(event.data.global)
      )
  }

  clickNode(node: NodeModel): void {
    console.log('started', node)
    node.hoverFixed = false
    node.fx = node.x
    node.fy = node.y

    this._clickedNode = node

    // Enable node dragging
    this._interactionManager.on('mousemove', this.appMouseMove.bind(this))
    // Disable viewport dragging
    this._viewport.pause = true
  }

  bindNodeClickEvent(nodeGfx: Container): void {
    nodeGfx.on('mousedown', (event: InteractionEvent) => {
      console.log('mouse down')
      this.clickNode(
        this._graph.findNodeById(
          this._nodeGfxToNodeData.get(event.currentTarget) as string
        ) as NodeModel
      )
    })
  }

  collapseNode(node: NodeModel): void {
    node.expanded = false
    const { nodes, relationships } = this._graph.collapseNode(node, {
      nodes: [],
      relationships: []
    })
    console.log('COLLAPSE', nodes, relationships)
    this._onGraphChange(nodes, relationships, 'collapse')
  }

  expandNode(node: NodeModel): void {
    node.expanded = true
    this._externalEventHandler.onExpandNode(
      node,
      this._graph.findNodeNeighbourIds(node.id),
      ({
        nodes: expandedBasicNodes,
        relationships: expandedBasicRelationships
      }) => {
        const expandedNodes = uniqBy(mapNodes(expandedBasicNodes), 'id')
        console.log(expandedNodes)
        this._graph.addExpandedNodes(node, expandedNodes)
        const expandedRelationships = uniqBy(
          mapRelationships(expandedBasicRelationships, this._graph),
          'id'
        )
        this._graph.addRelationships(expandedRelationships)
        this._onGraphChange(expandedNodes, expandedRelationships, 'expand')
      }
    )
  }

  dblClickNode(node: NodeModel): void {
    if (node.expanded) {
      console.log('expanded')
      this.collapseNode(node)
    } else {
      console.log('collapsed')
      this.expandNode(node)
    }
  }

  bindNodeDblClickEvent(nodeGfx: Container): void {
    nodeGfx.on('click', (event: InteractionEvent) => {
      console.log('click event', event)
      if (this._isDblClickNode) {
        console.log('dbl click')
        this.dblClickNode(
          this._graph.findNodeById(
            this._nodeGfxToNodeData.get(nodeGfx) as string
          ) as NodeModel
        )
        this._dblClickNodeTimeout && clearTimeout(this._dblClickNodeTimeout)
        this._dblClickNodeTimeout = null
        this._isDblClickNode = false
      } else {
        this._dblClickNodeTimeout = setTimeout(
          () => (this._isDblClickNode = false),
          400
        )
        this._isDblClickNode = true
      }
    })
  }

  releaseNode(): void {
    console.log('release node')
    this._clickedNode = null
    // Disable node dragging
    this._interactionManager.off('mousemove', this.appMouseMove)
    // Enable viewport dragging
    this._viewport.pause = false
  }

  bindNodeReleaseEvent(nodeGfx: Container): void {
    nodeGfx.on('mouseup', () => this.releaseNode())
    nodeGfx.on('mouseupoutside', () => this.releaseNode())
  }
}

export default EventHandler
