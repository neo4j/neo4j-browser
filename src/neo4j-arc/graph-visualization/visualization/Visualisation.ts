import { Cull } from '@pixi-essentials/cull'
import { GraphChangeType } from '../types'
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

import { ARROW_NAME, CAPTION_NAME, CIRCLE_NAME } from '../constants'
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
  private _nodesLayer: Container
  private _relationshipsLayer: Container

  private _style: GraphStyleModel
  private _geometry: Geometry
  private _layout: Layout
  private _forceSimulation: ForceSimulation
  private _eventHandler: EventHandler

  private _nodeRenderer: NodeRenderer
  private _relationshipRenderer: RelationshipRenderer
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
      // backgroundColor: 0xffff,
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

    this._relationshipsLayer = new Container()
    this._viewport.addChild(this._relationshipsLayer)
    this._nodesLayer = new Container()
    this._viewport.addChild(this._nodesLayer)

    this._style = style
    this._geometry = new Geometry(this._graph, style)
    this._nodeRenderer = new NodeRenderer(this._app.renderer, RESOLUTION)
    this._relationshipRenderer = new RelationshipRenderer(RESOLUTION)

    this._forceSimulation = new ForceSimulation(
      this._graph,
      this.updateVisualisation.bind(this),
      this.updateVisibility.bind(this)
    )

    this._eventHandler = new EventHandler({
      app: this._app,
      viewport: this._viewport,
      interactionManager,
      graph: this._graph,
      forceSimulation: this._forceSimulation,
      nodeShapeGfxToNodeData: this._nodeShapeGfxToNodeData,
      relationshipGfxToRelationshipData:
        this._relationshipGfxToRelationshipData,
      render: this.updateVisualisation.bind(this),
      onGraphChange: this.onGraphChange.bind(this),
      shouldBindD3DragHandler: this.shouldBindD3DragHandler,
      externalEventHandler
    })
  }

  get shouldBindD3DragHandler(): boolean {
    return (
      this._graph.getRelationships().length + this._graph.getNodes().length <
      1000
    )
  }

  get view(): Application['view'] {
    return this._app.view
  }

  get zoomStep(): number {
    const zoom = this._viewport.scale.x
    return this.calculateZoomStep(zoom)
  }

  calculateZoomStep(zoom: number): number {
    const zoomSteps = [0.1, 0.2, 0.4, Infinity]
    const zoomStep = zoomSteps.findIndex(zoomStep => zoom <= zoomStep)
    return zoomStep
  }

  createNodeDataGfxMapping(nodes: NodeModel[]): void {
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
        // this._eventHandler.bindNodeUnHoverEvent(nodeShapeGfx)
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

  removeNodeDataGfxMapping(nodes: NodeModel[]): void {
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

  createRelationshipDataGfxMapping(relationships: RelationshipModel[]): void {
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

  removeRelationshipDataGfxMapping(relationships: RelationshipModel[]): void {
    relationships.forEach(relationship => {
      const relationshipGfx =
        this._relationshipDataToRelationshipGfx[relationship.id]
      this._relationshipsLayer.removeChild(relationshipGfx)
      delete this._relationshipDataToRelationshipGfx[relationship.id]
    })
  }

  initVisualisation(): void {
    this.onGraphChange(
      this._graph.getNodes(),
      this._graph.getRelationships(),
      'init'
    )

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

    // initial draw
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

    // prevent body scrolling
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
          arrow.clear()
          this._relationshipRenderer.drawArrowBySvgPath(
            arrow,
            relationshipData.arrow?.outline(
              this.zoomStep >= 3 ? relationshipData.shortCaptionLength : 0
            ),
            colourToNumber(
              this._style.forRelationship(relationshipData).get('color')
            )
          )
        }
      }
    })
    this._previousZoomScale = this._viewport.scale.x
  }

  updateGeometry(nodeId?: string): void {
    this._geometry.pairwiseArcsRelationshipRouting.layoutRelationships(nodeId)
    // vGraph
    //   .getRelationships()
    //   .forEach(r => console.log(r.id, r.shortCaptionLength, r.shortCaption))
  }

  updateLayout(nodeId?: string): void {
    console.log('update layout')
    const nodes = nodeId
      ? [<NodeModel>this._graph.findNodeById(nodeId)]
      : this._graph.getNodes()
    const relationships = nodeId
      ? this._graph
          .getNodePairsByNodeId(nodeId)
          .reduce(
            (previousValue, currentValue) =>
              previousValue.concat(currentValue.relationships),
            [] as RelationshipModel[]
          )
      : this._graph.getRelationships()

    nodes.forEach(node => {
      const nodeShapeGfx = this._nodeDataToNodeShapeGfx[node.id]
      nodeShapeGfx.x = node.x
      nodeShapeGfx.y = node.y
      let circleSprite = nodeShapeGfx.getChildByName(CIRCLE_NAME)
      if (circleSprite) {
        if ((<Sprite>circleSprite).width !== node.radius * 2) {
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
        arrow.clear()
        this._relationshipRenderer.drawArrowBySvgPath(
          arrow,
          relationship.arrow?.outline(
            this.zoomStep >= 3 ? relationship.shortCaptionLength : 0
          ),
          colourToNumber(this._style.forRelationship(relationship).get('color'))
        )
      }

      relationshipGfx.x = relationship.source.x
      relationshipGfx.y = relationship.source.y
      relationshipGfx.rotation = Math.atan2(
        relationship.target.y - relationship.source.y,
        relationship.target.x - relationship.source.x
      )

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

  updateVisualisation(nodeId?: string): void {
    this.updateGeometry(nodeId)
    this.updateLayout(nodeId)
    this.shouldBindD3DragHandler && this.updateVisibility()
  }

  /**
   * Handles visualisation models and element mappings updates when graph data-set changes
   * @param nodes changed nodes
   * @param relationships changed relationships
   * @param type type of graph change
   */
  onGraphChange(
    nodes: NodeModel[],
    relationships: RelationshipModel[],
    type: GraphChangeType
  ): void {
    console.log('on graph change', type, nodes, relationships)
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
      this._forceSimulation.simulateNodes()
      this._forceSimulation.simulateRelationships()
    } else if (type === 'collapse') {
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
