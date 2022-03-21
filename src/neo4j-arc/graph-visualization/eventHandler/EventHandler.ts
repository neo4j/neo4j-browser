import { RelationshipModel } from '../models/Relationship'
import { uniqBy } from 'lodash-es'
import { Viewport } from 'pixi-viewport'
import {
  Container,
  DisplayObject,
  InteractionEvent,
  InteractionManager,
  Point
} from 'pixi.js'

import ForceSimulation from '../forceSimulation/ForceSimulation'
import { GraphModel } from '../models/Graph'
import { NodeModel } from '../models/Node'
import { GraphChangeHandler, MoveGfxBetweenLayers } from '../types'
import { mapNodes, mapRelationships } from '../utils/mapper'
import ExternalEventHandler from './ExternalEventHandler'

const DRAG_TOLERANCE = 25
const DB_CLICK_TIMEOUT = 400

class EventHandler {
  private _viewport: Viewport
  private _interactionManager: InteractionManager
  private _graph: GraphModel
  private _forceSimulation: ForceSimulation
  private _nodeShapeGfxToNodeData: WeakMap<DisplayObject, string>
  private _relationshipGfxToRelationshipData: WeakMap<DisplayObject, string>
  private _clickedNode: NodeModel | null
  private _clickedRelationship: RelationshipModel | null
  private _setClickedNode: (node: NodeModel | null) => void
  private _toggleContextMenu: (node: NodeModel | null) => void
  private _toggleSelectedRelationship: (
    relationship: RelationshipModel | null
  ) => void
  private _clickNodeTimeout: number | null
  private _dblClickNodeTimeout: number | null
  private _isDblClickNode: boolean
  private _clickRelationshipTimeout: number | null
  private _selectedItem: NodeModel | RelationshipModel | null
  private _render: (nodeIds: string[]) => void
  private _onGraphChange: GraphChangeHandler
  private _shouldBindD3DragHandler: () => boolean
  private _moveGfxBetweenLayers: MoveGfxBetweenLayers
  private _restartedSimulation: boolean
  private _initialDragPosition: { x: number; y: number }
  private _externalEventHandler: ExternalEventHandler

  constructor({
    viewport,
    interactionManager,
    graph,
    forceSimulation: simulation,
    nodeShapeGfxToNodeData,
    relationshipGfxToRelationshipData,
    setClickedNode,
    toggleContextMenu,
    toggleSelectedRelationship,
    shouldBindD3DragHandler,
    render,
    onGraphChange,
    moveGfxBetweenLayers,
    externalEventHandler
  }: {
    viewport: Viewport
    interactionManager: InteractionManager
    graph: GraphModel
    forceSimulation: ForceSimulation
    nodeShapeGfxToNodeData: WeakMap<Container, string>
    relationshipGfxToRelationshipData: WeakMap<Container, string>
    setClickedNode: (node: NodeModel | null) => void
    toggleContextMenu: (node: NodeModel | null) => void
    toggleSelectedRelationship: (relationship: RelationshipModel | null) => void
    shouldBindD3DragHandler: () => boolean
    render: (nodeIds?: string[]) => void
    onGraphChange: GraphChangeHandler
    moveGfxBetweenLayers: MoveGfxBetweenLayers
    externalEventHandler: ExternalEventHandler
  }) {
    // PIXI instances.
    this._viewport = viewport
    this._interactionManager = interactionManager

    this._viewport.on('clicked', () => {
      if (!this._clickedRelationship) {
        console.log('clicked')
        this._toggleContextMenu(null)
        this._toggleSelectedRelationship(null)
        this.deselectItem()
      }
    })

    this._graph = graph
    this._forceSimulation = simulation
    this._nodeShapeGfxToNodeData = nodeShapeGfxToNodeData
    this._relationshipGfxToRelationshipData = relationshipGfxToRelationshipData

    this._clickedNode = null
    this._clickNodeTimeout = null
    this._dblClickNodeTimeout = null
    this._isDblClickNode = false
    this._selectedItem = null
    this._clickedRelationship = null
    this._clickRelationshipTimeout = null

    this._setClickedNode = setClickedNode
    this._toggleContextMenu = toggleContextMenu
    this._toggleSelectedRelationship = toggleSelectedRelationship
    this._shouldBindD3DragHandler = shouldBindD3DragHandler
    this._render = render
    this._onGraphChange = onGraphChange

    this._moveGfxBetweenLayers = moveGfxBetweenLayers

    this._restartedSimulation = false
    this._initialDragPosition = { x: 0, y: 0 }
    this._externalEventHandler = externalEventHandler
  }

  hoverNode(node: NodeModel): void {
    // console.log('hover', node)
    if (!node.fx && !node.fy) {
      node.hoverFixed = true
      node.fx = node.x
      node.fy = node.y
    }
    this._externalEventHandler.onItemMouseOver({
      type: 'node',
      item: this._clickedNode ?? node
    })
    this._clickedNode?.id !== node.id &&
      this._moveGfxBetweenLayers(this._clickedNode ?? node, 'front')
  }

  bindNodeHoverEvent(nodeShapeGfx: Container): void {
    nodeShapeGfx.on('mouseover', (event: InteractionEvent) =>
      this.hoverNode(
        this._graph.findNodeById(
          this._nodeShapeGfxToNodeData.get(event.currentTarget) as string
        ) as NodeModel
      )
    )
  }

  unHoverNode(node: NodeModel): void {
    !this._clickedNode &&
      this._externalEventHandler.onItemMouseOver({
        type: 'canvas',
        item: {
          nodeCount: this._graph.getNodes().length,
          relationshipCount: this._graph.getRelationships().length
        }
      })

    !this._clickedNode && this._moveGfxBetweenLayers(node, 'behind')

    if (node.hoverFixed) {
      node.hoverFixed = false
      node.fx = null
      node.fy = null
    }
  }

  bindNodeUnHoverEvent(nodeGfx: Container): void {
    nodeGfx.on('mouseout', (event: InteractionEvent) =>
      this.unHoverNode(
        this._graph.findNodeById(
          this._nodeShapeGfxToNodeData.get(event.currentTarget) as string
        ) as NodeModel
      )
    )
  }

  selectItem(item: NodeModel | RelationshipModel): void {
    if (this._selectedItem) {
      this._selectedItem.selected = false
    }
    this._selectedItem = item
    item.selected = true
  }

  deselectItem(): void {
    if (this._selectedItem) {
      this._selectedItem.selected = false
      this._selectedItem = null
    }

    this._externalEventHandler.onItemSelect({
      type: 'canvas',
      item: {
        nodeCount: this._graph.getNodes().length,
        relationshipCount: this._graph.getRelationships().length
      }
    })
  }

  moveNode(node: NodeModel, point: Point): void {
    // Math.sqrt was removed to avoid unnecessary computation, since this
    // function is called very often when dragging.
    const dist =
      Math.pow(this._initialDragPosition.x - point.x, 2) +
      Math.pow(this._initialDragPosition.y - point.y, 2)
    if (dist > DRAG_TOLERANCE && !this._restartedSimulation) {
      // Set alphaTarget to a value higher than alphaMin so the simulation
      // isn't stopped while nodes are being dragged.
      if (this._shouldBindD3DragHandler() && !this._isDblClickNode) {
        this._forceSimulation.simulateNodeDrag()
        this._restartedSimulation = true
      }
    }

    node.x = point.x
    node.y = point.y
    // Make sure node position won't be changed when restart simulation.
    node.fx = point.x
    node.fy = point.y

    // If the drag event is handled by D3Drag, we don't do duplicated re-render.
    !this._shouldBindD3DragHandler() && this._render([node.id])
  }

  appMouseMove(event: InteractionEvent): void {
    if (!this._clickedNode) {
      return
    }

    // console.log('moving', event)
    this.moveNode(this._clickedNode, this._viewport.toWorld(event.data.global))
  }

  clickNode(node: NodeModel): void {
    console.log('started', node)
    node.hoverFixed = false
    node.fx = node.x
    node.fy = node.y

    this._clickedNode = node
    this._setClickedNode(node)

    this._clickNodeTimeout = setTimeout(() => {
      if (this._interactionManager.eventData.type !== 'mousemove') {
        if (!node.selected) {
          this.selectItem(node)
          this._externalEventHandler.onItemSelect({ type: 'node', item: node })
          this._toggleContextMenu(node)
          this._toggleSelectedRelationship(null)
        } else {
          this.deselectItem()
          this._toggleContextMenu(null)
        }
      }
      this._clickNodeTimeout && clearTimeout(this._clickNodeTimeout)
      this._clickNodeTimeout = null
    }, 50)

    this._forceSimulation.shouldSimulateAllNodes =
      this._shouldBindD3DragHandler()

    this._initialDragPosition = { x: node.x, y: node.y }
    this._restartedSimulation = false

    // Enable node dragging.
    this._interactionManager.on('mousemove', this.appMouseMove.bind(this))
    // Disable viewport dragging.
    this._viewport.pause = true
  }

  bindNodeClickEvent(nodeGfx: Container): void {
    nodeGfx.on('mousedown', (event: InteractionEvent) => {
      console.log('mouse down')
      this.clickNode(
        this._graph.findNodeById(
          this._nodeShapeGfxToNodeData.get(event.currentTarget) as string
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
        this._onGraphChange(expandedNodes, expandedRelationships, 'expand', {
          center: { x: node.x, y: node.y }
        })
      }
    )
  }

  expandOrCollapseNode(node: NodeModel): void {
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
        this.expandOrCollapseNode(
          this._graph.findNodeById(
            this._nodeShapeGfxToNodeData.get(nodeGfx) as string
          ) as NodeModel
        )
        this._dblClickNodeTimeout && clearTimeout(this._dblClickNodeTimeout)
        this._dblClickNodeTimeout = null
        this._isDblClickNode = false
      } else {
        this._dblClickNodeTimeout = setTimeout(
          () => (this._isDblClickNode = false),
          DB_CLICK_TIMEOUT
        )
        this._isDblClickNode = true
      }
    })
  }

  releaseNode(): void {
    console.log('release node')

    this._clickedNode = null
    this._setClickedNode(null)

    if (this._shouldBindD3DragHandler()) {
      this._restartedSimulation && this._forceSimulation.stopSimulateNodeDrag()
    }
    this._restartedSimulation = false

    // Disable node dragging.
    this._interactionManager.off('mousemove', this.appMouseMove)
    // Enable viewport dragging.
    this._viewport.pause = false
  }

  bindNodeReleaseEvent(nodeGfx: Container): void {
    nodeGfx.on('mouseup', () => this.releaseNode())
    nodeGfx.on('mouseupoutside', () => this.releaseNode())
  }

  hoverRelationship(relationship: RelationshipModel): void {
    console.log('hover', relationship)
    if (!this._clickedNode) {
      this._externalEventHandler.onItemMouseOver({
        type: 'relationship',
        item: relationship
      })
      this._moveGfxBetweenLayers(relationship, 'front')
    }
  }

  bindRelationshipHoverEvent(relationshipGfx: Container): void {
    relationshipGfx.on('mouseover', (event: InteractionEvent) =>
      this.hoverRelationship(
        this._graph.findRelationshipById(
          this._relationshipGfxToRelationshipData.get(
            event.currentTarget
          ) as string
        ) as RelationshipModel
      )
    )
  }

  unhoverRelationship(relationship: RelationshipModel): void {
    this._moveGfxBetweenLayers(relationship, 'behind')
  }

  bindRelationshipUnhoverEvent(relationshipGfx: Container): void {
    relationshipGfx.on('mouseout', (event: InteractionEvent) => {
      this._externalEventHandler.onItemMouseOver({
        type: 'canvas',
        item: {
          nodeCount: this._graph.getNodes().length,
          relationshipCount: this._graph.getRelationships().length
        }
      })
      this.unhoverRelationship(
        this._graph.findRelationshipById(
          this._relationshipGfxToRelationshipData.get(
            event.currentTarget
          ) as string
        ) as RelationshipModel
      )
    })
  }

  clickRelationship(relationship: RelationshipModel): void {
    this._clickedRelationship = relationship
    if (!relationship.selected) {
      this.selectItem(relationship)
      this._toggleContextMenu(null)
      this._toggleSelectedRelationship(relationship)
      this._externalEventHandler.onItemSelect({
        type: 'relationship',
        item: relationship
      })
    } else {
      this.deselectItem()
      this._toggleSelectedRelationship(null)
    }
  }

  bindRelationshipClickEvent(relationshipGfx: Container): void {
    relationshipGfx.on('click', (event: InteractionEvent) => {
      this.clickRelationship(
        this._graph.findRelationshipById(
          this._relationshipGfxToRelationshipData.get(
            event.currentTarget
          ) as string
        ) as RelationshipModel
      )
    })
  }

  releaseRelationship(): void {
    console.log('release relationship')

    this._clickRelationshipTimeout = setTimeout(() => {
      this._clickedRelationship = null
      this._clickRelationshipTimeout &&
        clearTimeout(this._clickRelationshipTimeout)
    }, 100)
  }

  bindRelationshipReleaseEvent(relationshipGfx: Container): void {
    relationshipGfx.on('mouseup', () => this.releaseRelationship())
    relationshipGfx.on('mouseupoutside', () => this.releaseRelationship())
  }

  bindContextMenuExpandCollapseArcClickEvent(
    item: Container,
    node: NodeModel
  ): void {
    item.on('click', () => this.expandOrCollapseNode(node))
  }

  closeNode(node: NodeModel): void {
    const relationshipsToRemove = this._graph.findAllRelationshipToNode(node)
    this._graph.removeConnectedRelationships(node)
    this._graph.removeNode(node)
    this.deselectItem()
    this._onGraphChange([node], relationshipsToRemove, 'collapse')
  }

  bindCloseNodeArcClickEvent(item: Container, node: NodeModel): void {
    item.on('click', () => this.closeNode(node))
  }

  unlockNode(node: NodeModel): void {
    node.fx = null
    node.fy = null
    this.deselectItem()
  }

  bindUnlockNodeArcClickEvent(item: Container, node: NodeModel): void {
    item.on('click', () => this.unlockNode(node))
  }
}

export default EventHandler
