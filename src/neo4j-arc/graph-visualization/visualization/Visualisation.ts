import { Cull } from '@pixi-essentials/cull'
import { GraphChangeHandler, MoveGfxBetweenLayers } from '../types'
import { Viewport } from 'pixi-viewport'
import {
  Application,
  Container,
  Graphics,
  InteractionManager,
  Sprite,
  Text
} from 'pixi.js'

import { GraphStyleModel } from '../models/GraphStyle'

import {
  ARROW_NAME,
  CAPTION_NAME,
  CIRCLE_NAME,
  HOVER_HIGHLIGHT_COLOUR
} from '../constants'
import EventHandler from '../eventHandler/EventHandler'
import ExternalEventHandler from '../eventHandler/ExternalEventHandler'
import ForceSimulation from '../forceSimulation/ForceSimulation'
import Geometry from '../geometry/Geometry'
import Layout from '../layout/Layout'
import { GraphModel } from '../models/Graph'
import { NodeModel } from '../models/Node'
import { RelationshipModel } from '../models/Relationship'
import { colourToNumber } from '../utils/colour'
import RelationshipRenderer from './renderers/RelationshipRenderer'
import NodeRenderer from './renderers/NodeRenderer'
import { uniqBy } from 'lodash-es'
import ContextMenuRenderer from './renderers/ContextMenuRenderer'

const SCREEN_WIDTH = 1200
const SCREEN_HEIGHT = 500
const RESOLUTION = window.devicePixelRatio

class Visualisation {
  private _graph: GraphModel
  private _nodeDataToNodeShapeGfx: Record<string, Container>
  private _nodeDataToNodeCaptionGfx: Record<string, Container>
  private _nodeShapeGfxToNodeData: WeakMap<Container, string>
  private _relationshipDataToRelationshipGfx: Record<string, Container>
  private _relationshipGfxToRelationshipData: WeakMap<Container, string>

  private _app: Application
  private _viewport: Viewport
  private _previousZoomScale: number
  private _frontNodesLayer: Container
  private _contextMenuLayer: Container
  private _nodesLayer: Container
  private _frontRelationshipsLayer: Container
  private _hoverRelationshipHighlightGfx: Container
  private _relationshipsLayer: Container
  private _hoverNodeHighlightGfx: Container
  private _contextMenuGfx: Container

  private _style: GraphStyleModel
  private _geometry: Geometry
  private _layout: Layout
  private _forceSimulation: ForceSimulation
  private _eventHandler: EventHandler

  private _clickedNode: NodeModel | null

  private _nodeRenderer: NodeRenderer
  private _relationshipRenderer: RelationshipRenderer
  private _contextMenuRenderer: ContextMenuRenderer
  private _renderRequestId: number | undefined = undefined

  constructor(
    graph: GraphModel,
    style: GraphStyleModel,
    externalEventHandler: ExternalEventHandler
  ) {
    this._graph = graph
    this._nodeDataToNodeShapeGfx = {}
    this._nodeDataToNodeCaptionGfx = {}
    this._nodeShapeGfxToNodeData = new WeakMap()
    this._relationshipDataToRelationshipGfx = {}
    this._relationshipGfxToRelationshipData = new WeakMap()

    // Create PIXI application.
    this._app = new Application({
      width: SCREEN_WIDTH,
      height: SCREEN_HEIGHT,
      resolution: RESOLUTION,
      backgroundAlpha: 0,
      antialias: true,
      autoDensity: true
      // autoStart: false // disable automatic rendering by ticker, render manually instead, only when needed
    })
    this._app.view.style.width = `${SCREEN_WIDTH}px`
    const interactionManager = new InteractionManager(this._app.renderer)

    this._layout = new Layout(this._graph, SCREEN_WIDTH, SCREEN_HEIGHT)

    const { worldWidth: WORLD_WIDTH, worldHeight: WORLD_HEIGHT } =
      this._layout.initViewportDimension()

    // Create PIXI viewport.
    this._viewport = new Viewport({
      screenWidth: SCREEN_WIDTH,
      screenHeight: SCREEN_HEIGHT,
      worldWidth: WORLD_WIDTH,
      worldHeight: WORLD_HEIGHT,
      interaction: interactionManager
    })
    this._previousZoomScale = 0
    this._app.stage.addChild(this._viewport)
    this._viewport.drag().pinch().wheel().decelerate()

    // Create layers: relationships, front relationships, nodes, front nodes.
    this._relationshipsLayer = new Container()
    this._viewport.addChild(this._relationshipsLayer)

    this._frontRelationshipsLayer = new Container()
    this._viewport.addChild(this._frontRelationshipsLayer)
    this._hoverRelationshipHighlightGfx = new Container()
    this._hoverRelationshipHighlightGfx.alpha = 0.35
    this._frontRelationshipsLayer.addChild(this._hoverRelationshipHighlightGfx)

    this._contextMenuLayer = new Container()
    this._viewport.addChild(this._contextMenuLayer)

    this._nodesLayer = new Container()
    this._viewport.addChild(this._nodesLayer)

    this._contextMenuGfx = new Container()
    this._contextMenuLayer.addChild(this._contextMenuGfx)

    this._frontNodesLayer = new Container()
    this._viewport.addChild(this._frontNodesLayer)
    this._hoverNodeHighlightGfx = new Container()
    this._hoverNodeHighlightGfx.alpha = 0.35
    this._frontNodesLayer.addChild(this._hoverNodeHighlightGfx)

    this._clickedNode = null

    this._style = style
    this._geometry = new Geometry(this._graph, style)
    this._nodeRenderer = new NodeRenderer(this._app.renderer, RESOLUTION)
    this._relationshipRenderer = new RelationshipRenderer(RESOLUTION)
    this._contextMenuRenderer = new ContextMenuRenderer(this._app.renderer)

    this._forceSimulation = new ForceSimulation(
      this._graph,
      this.updateVisualisation.bind(this),
      this.updateVisibility.bind(this)
    )

    this._eventHandler = new EventHandler({
      viewport: this._viewport,
      interactionManager,
      graph: this._graph,
      forceSimulation: this._forceSimulation,
      nodeShapeGfxToNodeData: this._nodeShapeGfxToNodeData,
      relationshipGfxToRelationshipData:
        this._relationshipGfxToRelationshipData,
      setClickedNode: this.setClickedNode.bind(this),
      toggleContextMenu: this.toggleContextMenu.bind(this),
      shouldBindD3DragHandler: this.shouldSimulateAllNodes.bind(this),
      render: this.updateVisualisation.bind(this),
      onGraphChange: this.onGraphChange.bind(this),
      moveGfxBetweenLayers: this.moveGfxBetweenLayers.bind(this),
      externalEventHandler
    })
  }

  get view(): Application['view'] {
    return this._app.view
  }

  get zoomStep(): number {
    const zoom = this._viewport.scale.x
    return this.calculateZoomStep(zoom)
  }

  shouldSimulateAllNodes(): boolean {
    return (
      this._graph.getRelationships().length + this._graph.getNodes().length <
      1000
    )
  }

  setClickedNode(node: NodeModel | null): void {
    this._clickedNode = node
  }

  toggleContextMenu(node: NodeModel | null): void {
    if (node) {
      console.log('SELECT NODE', node)

      this._contextMenuGfx.addChild(
        this._contextMenuRenderer.drawContextMenu(node.radius + 30, node.radius)
      )
      this._contextMenuGfx.x = node.x
      this._contextMenuGfx.y = node.y
      this._eventHandler.bindContextMenuExpandCollapseArcClickEvent(
        this._contextMenuRenderer.expandCollpaseItem,
        node
      )
      this._eventHandler.bindCloseNodeArcClicEvent(
        this._contextMenuRenderer.closeNodeSection,
        node
      )
    } else {
      this._contextMenuGfx.removeChildren()
    }
  }

  private calculateZoomStep(zoom: number): number {
    const zoomSteps = [0.1, 0.2, 0.4, Infinity]
    const zoomStep = zoomSteps.findIndex(zoomStep => zoom <= zoomStep)
    return zoomStep
  }

  private createNodeDataGfxMapping(nodes: NodeModel[]): void {
    // Create node graphics.
    const nodeDataGfxPairs = nodes.map(node => {
      let nodeShapeGfx: Container
      if (this._nodeDataToNodeShapeGfx[node.id]) {
        nodeShapeGfx = this._nodeDataToNodeShapeGfx[node.id]
      } else {
        nodeShapeGfx =
          this._nodeDataToNodeShapeGfx[node.id] ??
          this._nodeRenderer.drawNodeShapeGfx(
            node.radius,
            this._style.forNode(node).get('color')
          )
        // Bind node circle events.
        this._eventHandler.bindNodeHoverEvent(nodeShapeGfx)
        this._eventHandler.bindNodeUnHoverEvent(nodeShapeGfx)
        this._eventHandler.bindNodeClickEvent(nodeShapeGfx)
        this._eventHandler.bindNodeDblClickEvent(nodeShapeGfx)
        this._eventHandler.bindNodeReleaseEvent(nodeShapeGfx)
        this._nodesLayer.addChild(nodeShapeGfx)
      }

      let nodeCaptionGfx: Container
      if (this._nodeDataToNodeCaptionGfx[node.id]) {
        nodeCaptionGfx = this._nodeDataToNodeCaptionGfx[node.id]
      } else {
        nodeCaptionGfx = this._nodeRenderer.drawNodeCaptionGfx(
          node.caption.map(captionLine => captionLine.text).join('\n'),
          parseFloat(this._style.forNode(node).get('font-size')),
          this._style.forNode(node).get('text-color-internal')
        )
        this._nodesLayer.addChild(nodeCaptionGfx)
      }

      return { node, nodeShapeGfx, nodeCaptionGfx }
    })

    // Map node data and node graphics.
    nodeDataGfxPairs.forEach(
      ({ node: nodeData, nodeShapeGfx, nodeCaptionGfx }) => {
        this._nodeDataToNodeShapeGfx[nodeData.id] = nodeShapeGfx
        this._nodeDataToNodeCaptionGfx[nodeData.id] = nodeCaptionGfx
        this._nodeShapeGfxToNodeData.set(nodeShapeGfx, nodeData.id)
      }
    )
  }

  private removeNodeDataGfxMapping(nodes: NodeModel[]): void {
    nodes.forEach(node => {
      const nodeShapeGfx = this._nodeDataToNodeShapeGfx[node.id]
      this._nodesLayer.removeChild(nodeShapeGfx)
      delete this._nodeDataToNodeShapeGfx[node.id]
      this._nodeShapeGfxToNodeData.delete(nodeShapeGfx)

      const nodeCaptionGfx = this._nodeDataToNodeCaptionGfx[node.id]
      this._nodesLayer.removeChild(nodeCaptionGfx)
      delete this._nodeDataToNodeCaptionGfx[node.id]
    })
  }

  private createRelationshipDataGfxMapping(
    relationships: RelationshipModel[]
  ): void {
    // Create relationship graphics.
    const relationshipDataGfxPairs = relationships.map(relationship => {
      let relationshipGfx: Container
      if (this._relationshipDataToRelationshipGfx[relationship.id]) {
        relationshipGfx =
          this._relationshipDataToRelationshipGfx[relationship.id]
      } else {
        relationshipGfx = this._relationshipRenderer.drawRelationshipGfx(
          relationship.shortCaption,
          this._style.forRelationship(relationship).get('font-size')
        )

        // Bind relationship events.
        this._eventHandler.bindRelationshipHoverEvent(relationshipGfx)
        this._eventHandler.bindRelationshipUnhoverEvent(relationshipGfx)
      }

      this._relationshipsLayer.addChild(relationshipGfx)

      return { relationship, relationshipGfx }
    })

    // Map relationship data and relationship graphics.
    relationshipDataGfxPairs.forEach(
      ({ relationship: relationshipData, relationshipGfx }) => {
        this._relationshipDataToRelationshipGfx[relationshipData.id] =
          relationshipGfx
        this._relationshipGfxToRelationshipData.set(
          relationshipGfx,
          relationshipData.id
        )
      }
    )
  }

  private removeRelationshipDataGfxMapping(
    relationships: RelationshipModel[]
  ): void {
    relationships.forEach(relationship => {
      const relationshipGfx =
        this._relationshipDataToRelationshipGfx[relationship.id]
      this._relationshipsLayer.removeChild(relationshipGfx)
      delete this._relationshipDataToRelationshipGfx[relationship.id]
      this._relationshipGfxToRelationshipData.delete(relationshipGfx)
    })
  }

  initVisualisation(): void {
    // Initial draw.
    this.onGraphChange(
      this._graph.getNodes(),
      this._graph.getRelationships(),
      'init'
    )

    // this._viewport.addChild(this._contextMenuRenderer.drawContextMenu())

    // initial layout

    const resetViewport = () => {
      // const {minNodeX, maxNodeX, minNodeY, maxNodeY} = layout.getBoundaries()
      // viewport.center = new Point(
      //   (maxNodeX - minNodeX) / 2,
      //   (maxNodeY - minNodeY) / 2
      // )
      this._viewport.fitWorld(true)
      // this._viewport.setZoom(1)
    }

    resetViewport()
    this._previousZoomScale = this._viewport.scale.x

    this._viewport.on('frame-end', () => {
      // console.log(
      //   'frame-end',
      //   this._previousZoomScale,
      //   this._viewport.scale,
      //   this.calculateZoomStep(this._previousZoomScale),
      //   this.zoomStep
      // )
      if (this._viewport.dirty) {
        this.updateVisibility()
        this.requestRender()
        this._viewport.dirty = false
      }
    })

    // Prevent body scrolling.
    this._app.view.addEventListener('wheel', event => {
      event.preventDefault()
    })
    this._app.render()
  }

  updateVisibility = (): void => {
    // Culling.
    const cull = new Cull()
    cull.addAll(this._nodesLayer.children)
    cull.addAll(this._relationshipsLayer.children)
    cull.cull(this._app.renderer.screen)

    // Levels of detail.
    this._contextMenuLayer.visible = this.zoomStep >= 1
    this._hoverNodeHighlightGfx.visible = this.zoomStep >= 3
    this._hoverRelationshipHighlightGfx.visible = this.zoomStep >= 3

    this._graph.getNodes().forEach(nodeData => {
      const captionGfx = this._nodeDataToNodeCaptionGfx[nodeData.id]
      const caption = captionGfx.getChildByName(CAPTION_NAME)
      caption.visible = this.zoomStep >= 3
    })

    this._relationshipsLayer.visible = this.zoomStep >= 1
    this._graph.getRelationships().forEach(relationshipData => {
      const relationshipGfx =
        this._relationshipDataToRelationshipGfx[relationshipData.id]
      const arrow = relationshipGfx.getChildByName(ARROW_NAME) as Graphics
      const caption = relationshipGfx.getChildByName(CAPTION_NAME)

      arrow.visible = this.zoomStep >= 1
      caption.visible = this.zoomStep >= 3
      const previousZoomStep = this.calculateZoomStep(this._previousZoomScale)
      if (
        previousZoomStep !== this.zoomStep &&
        this._relationshipsLayer.visible
      ) {
        if (
          previousZoomStep < 1 ||
          (previousZoomStep < 3 && this.zoomStep >= 3) ||
          (previousZoomStep >= 3 && this.zoomStep < 3)
        ) {
          this.redrawRelationshipArrow(arrow, relationshipData)
        }
      }
    })
    this._previousZoomScale = this._viewport.scale.x
  }

  updateGeometry(nodeIds?: string[]): void {
    ;(nodeIds ?? this._graph.getNodes().map(node => node.id)).forEach(
      nodeId => {
        this._geometry.pairwiseArcsRelationshipRouting.layoutRelationships(
          nodeId
        )
      }
    )
  }

  private redrawRelationshipHighlight(
    arrow: Graphics,
    relationship: RelationshipModel
  ): void {
    arrow.clear()
    this._relationshipRenderer.drawArrowBySvgPath(
      arrow,
      relationship.arrow?.overlay(16),
      colourToNumber(HOVER_HIGHLIGHT_COLOUR)
    )
  }

  private redrawRelationshipArrow(
    arrow: Graphics,
    relationship: RelationshipModel
  ): void {
    arrow.clear()
    this._relationshipRenderer.drawArrowBySvgPath(
      arrow,
      relationship.arrow?.outline(
        this.zoomStep >= 3 ? relationship.shortCaptionLength : 0
      ),
      colourToNumber(this._style.forRelationship(relationship).get('color'))
    )
  }

  private layoutRelationshipGfx(
    relationshipGfx: Container,
    relationship: RelationshipModel
  ): void {
    relationshipGfx.x = relationship.source.x
    relationshipGfx.y = relationship.source.y
    relationshipGfx.rotation = Math.atan2(
      relationship.target.y - relationship.source.y,
      relationship.target.x - relationship.source.x
    )
  }

  updateLayout(nodeIds?: string[]): void {
    console.log('update layout')
    const nodes = nodeIds
      ? this._graph.getNodes().filter(node => nodeIds.includes(node.id))
      : this._graph.getNodes()
    const relationships = nodeIds
      ? uniqBy(
          nodeIds.reduce(
            (relationships, nodeId) =>
              relationships.concat(
                this._graph
                  .getNodePairsByNodeId(nodeId)
                  .reduce(
                    (previousValue, nodePair) =>
                      previousValue.concat(nodePair.relationships),
                    [] as RelationshipModel[]
                  )
              ),
            [] as RelationshipModel[]
          ),
          'id'
        )
      : this._graph.getRelationships()

    if (this._clickedNode) {
      this._hoverNodeHighlightGfx.x = this._clickedNode.x
      this._hoverNodeHighlightGfx.y = this._clickedNode.y

      this._contextMenuGfx.x = this._clickedNode.x
      this._contextMenuGfx.y = this._clickedNode.y
    }

    nodes.forEach(node => {
      const nodeShapeGfx = this._nodeDataToNodeShapeGfx[node.id]
      nodeShapeGfx.x = node.x
      nodeShapeGfx.y = node.y
      let circleSprite = nodeShapeGfx.getChildByName(CIRCLE_NAME)
      if (circleSprite) {
        if ((<Sprite>circleSprite).width !== node.radius * 2) {
          if (node.selected) {
            this.toggleContextMenu(null)
            this.toggleContextMenu(node)
          }
          nodeShapeGfx.removeChild(circleSprite)
          circleSprite = this._nodeRenderer.drawNodeCircleSprite(
            node.radius,
            this._style.forNode(node).get('color')
          )
          nodeShapeGfx.addChild(circleSprite)
        }
        ;(<Sprite>circleSprite).tint = colourToNumber(
          this._style.forNode(node).get('color')
        )
      }

      const nodeCaptionGfx = this._nodeDataToNodeCaptionGfx[node.id]
      nodeCaptionGfx.x = node.x
      nodeCaptionGfx.y = node.y
      const caption = nodeCaptionGfx.getChildByName(CAPTION_NAME)
      if (caption) {
        if (
          (circleSprite && (<Sprite>circleSprite).width !== node.radius * 2) ||
          (<Text>caption).text !==
            node.caption.map(captionLine => captionLine.text).join('\n')
        ) {
          console.log('rerender text')
          ;(<Text>caption).text = node.caption
            .map(captionLine => captionLine.text)
            .join('\n')
          caption.x = -(<Text>caption).width / 2
          caption.y = -(<Text>caption).height / 2
        }
      }
    })

    relationships.forEach(relationship => {
      const relationshipGfx =
        this._relationshipDataToRelationshipGfx[relationship.id]
      // const line = relationshipGfx.getChildByName(LINE_NAME) as Sprite

      // const lineLength = Math.max(
      //   Math.sqrt(
      //     (relationship.target.x - relationship.source.x) ** 2 +
      //       (relationship.target.y - relationship.source.y) ** 2
      //   ) -
      //     NODE_BORDER_RADIUS * 2,
      //   0
      // )

      const arrow = relationshipGfx.getChildByName(ARROW_NAME) as Graphics
      if (arrow.visible) {
        this.redrawRelationshipArrow(arrow, relationship)
      }

      this.layoutRelationshipGfx(relationshipGfx, relationship)

      // console.log(
      //   this._style
      //     .forRelationship(relationship)
      //     .get(`text-color-${relationship.captionLayout}`)
      // )
      const caption = relationshipGfx.getChildByName(CAPTION_NAME) as Text
      this._relationshipRenderer.updateRelationshipCaption(
        caption,
        relationship.shortCaption,
        relationship.arrow?.midShaftPoint?.x ?? 0,
        relationship.arrow?.midShaftPoint?.y ?? 0,
        relationship.naturalAngle < 90 || relationship.naturalAngle > 270
          ? 135
          : 0
      )
    })
  }

  private moveNodeGfxToFront(node: NodeModel): void {
    const nodeShapeGfx = this._nodeDataToNodeShapeGfx[node.id]
    const nodeCaptionGfx = this._nodeDataToNodeCaptionGfx[node.id]
    this._nodesLayer.removeChild(nodeShapeGfx)
    this._nodesLayer.removeChild(nodeCaptionGfx)
    this._hoverNodeHighlightGfx.removeChildren()
    this._hoverNodeHighlightGfx.x = node.x
    this._hoverNodeHighlightGfx.y = node.y
    this._hoverNodeHighlightGfx.addChild(
      this._nodeRenderer.drawNodeCircleSprite(
        node.radius + 4,
        HOVER_HIGHLIGHT_COLOUR
      )
    )
    this._frontNodesLayer.addChild(nodeShapeGfx)
    this._frontNodesLayer.addChild(nodeCaptionGfx)
  }

  private moveNodeGfxToBehind(node: NodeModel): void {
    this._hoverNodeHighlightGfx.removeChildren()
    const nodeShapeGfx = this._nodeDataToNodeShapeGfx[node.id]
    const nodeCaptionGfx = this._nodeDataToNodeCaptionGfx[node.id]
    this._frontNodesLayer.removeChild(nodeShapeGfx)
    this._frontNodesLayer.removeChild(nodeCaptionGfx)
    this._nodesLayer.addChild(nodeShapeGfx)
    this._nodesLayer.addChild(nodeCaptionGfx)
  }

  private moveRelationshipGfxToFront(relationship: RelationshipModel): void {
    const relationshipGfx =
      this._relationshipDataToRelationshipGfx[relationship.id]
    this._relationshipsLayer.removeChild(relationshipGfx)
    this._hoverRelationshipHighlightGfx.removeChildren()
    this.layoutRelationshipGfx(
      this._hoverRelationshipHighlightGfx,
      relationship
    )
    const arrow = new Graphics()
    this.redrawRelationshipHighlight(arrow, relationship)
    this._hoverRelationshipHighlightGfx.addChild(arrow)
    this._frontRelationshipsLayer.addChild(relationshipGfx)
  }

  private moveRelationshipGfxToBehind(relationship: RelationshipModel): void {
    this._hoverRelationshipHighlightGfx.removeChildren()
    const relationshipGfx =
      this._relationshipDataToRelationshipGfx[relationship.id]
    this._frontRelationshipsLayer.removeChild(relationshipGfx)
    this._relationshipsLayer.addChild(relationshipGfx)
  }

  moveGfxBetweenLayers: MoveGfxBetweenLayers = (data, position) => {
    console.log(data, position)
    if (data.isNode) {
      if (position === 'front')
        this.moveNodeGfxToFront(data as unknown as NodeModel)
      else this.moveNodeGfxToBehind(data as unknown as NodeModel)
    } else {
      if (position === 'front') {
        this.moveRelationshipGfxToFront(data as unknown as RelationshipModel)
      } else
        this.moveRelationshipGfxToBehind(data as unknown as RelationshipModel)
    }
  }

  updateVisualisation(nodeIds?: string[]): void {
    this.updateGeometry(nodeIds)
    this.updateLayout(nodeIds)
    this.shouldSimulateAllNodes() && this.updateVisibility()
  }

  /**
   * Handles models and visualisation element mappings when graph data-set changes,
   * also triggers force simulation and render under certain change type.
   * @param nodes nodes model have been changed
   * @param relationships relationships model have been changed
   * @param type type of graph change
   * @param options addition options to handle the graph visualisation update
   */
  onGraphChange: GraphChangeHandler = (nodes, relationships, type, options) => {
    console.log('on graph change', type, nodes, relationships)
    // Update graph visual element geometries when initialising the visualisation,
    // updating visualisation styles or expanding nodes/relationships.
    if (type === 'init' || type === 'update' || type === 'expand') {
      nodes.forEach(node => {
        this._geometry.setNodeRadii(node)
        this._geometry.formatNodeCaption(node)
      })
      relationships.forEach(relationship => {
        this._geometry.formatRelationshipCaption(relationship)
        this._geometry.pairwiseArcsRelationshipRouting.measureRelationshipCaption(
          relationship
        )
      })
    }

    if (type === 'init' || type === 'expand') {
      this.createNodeDataGfxMapping(nodes)
      this.createRelationshipDataGfxMapping(relationships)

      this._forceSimulation.shouldSimulateAllNodes =
        this.shouldSimulateAllNodes()
      nodes.length > 0 &&
        this._forceSimulation.simulateNodes(nodes, options?.center)
      this._forceSimulation.simulateRelationships()
    } else if (type === 'collapse') {
      this._forceSimulation.shouldSimulateAllNodes =
        this.shouldSimulateAllNodes()
      this.removeNodeDataGfxMapping(nodes)
      this.removeRelationshipDataGfxMapping(relationships)
    }

    if (type === 'init') {
      if (
        this._graph.getNodes().length > 1000 ||
        this._graph.getRelationships().length > 1000
      )
        this._forceSimulation.precompute()
      else this._forceSimulation.restart()
    } else if (type === 'expand') {
      if (nodes.length > 0) this._forceSimulation.restart()
    } else if (type === 'update') {
      this.updateVisualisation()
    }
  }

  requestRender(): void {
    if (this._renderRequestId) {
      return
    }
    this._renderRequestId = window.requestAnimationFrame(() => {
      this._app.render()
      this._renderRequestId = undefined
    })
  }

  /**
   * Destroy PIXI application and release memory
   */
  destory(): void {
    if (this._renderRequestId) {
      window.cancelAnimationFrame(this._renderRequestId)
      this._renderRequestId = undefined
    }

    this._app.destroy(true, true)
  }
}

export default Visualisation
