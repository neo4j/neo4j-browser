import { Cull } from '@pixi-essentials/cull'
import { BasicNode, BasicRelationship } from 'neo4j-arc/common'
import { Viewport } from 'pixi-viewport'
import {
  Application,
  Circle,
  Container,
  Graphics,
  InteractionManager,
  Point,
  Sprite,
  Texture,
  settings
} from 'pixi.js'
import React, { useEffect, useRef } from 'react'

<<<<<<< HEAD:src/neo4j-arc/graph-visualization/GraphVisualizer/GraphCanvas.tsx
import Geometry from '../../../browser/modules/D3Visualization/lib/geometry/Geometry'
import { arcToCurve, parser } from '../../../browser/modules/D3Visualization/lib/geometry/utils'
import Layout from '../../../browser/modules/D3Visualization/lib/layout/Layout'
import VGraph from '../../../browser/modules/D3Visualization/lib/models/VGraph'
import VNode from '../../../browser/modules/D3Visualization/lib/models/VNode'
import VRelationship from '../../../browser/modules/D3Visualization/lib/models/VRelationship'
import { BasicNode, BasicRelationship } from '../../common/types/arc-types'
=======
import EventHandler from '../eventHandler/EventHandler'
import ForceSimulation from '../forceSimulation/ForceSimulation'
import Geometry from '../geometry/Geometry'
import { arcToCurve, svgPathParser } from '../geometry/utils'
import Layout from '../layout/Layout'
import { GraphModel } from '../models/Graph'
import { GraphStyleModel } from '../models/GraphStyle'
import { NodeModel } from '../models/Node'
import { RelationshipModel } from '../models/Relationship'
>>>>>>> d115e292f9... feat: adjust zooming rates:src/neo4j-arc/graph-visualization/GraphVisualizer/Graph/GraphCanvas.tsx

const SCREEN_WIDTH = 600
const SCREEN_HEIGHT = 400
const RESOLUTION = window.devicePixelRatio

const TEXTURE_COLOR = 0xffffff
const NODE_RADIUS = 25
const NODE_BORDER_WIDTH = 2
const NODE_BORDER_RADIUS = NODE_RADIUS + NODE_BORDER_WIDTH
const NODE_HIT_RADIUS = 25
const LINE_NAME = 'LINE'
const relationshipSize = 2

const colorToNumber = (color: string) => parseInt(color.slice(1), 16)

type GraphCanvasProps = {
  nodes: BasicNode[]
  relationships: BasicRelationship[]
}

export const GraphCanvas = (props: GraphCanvasProps): JSX.Element => {
  const { nodes, relationships } = props

  const canvasContainer = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const vGraph = new GraphModel()
    vGraph.addNodes(
      nodes.map(
        node =>
          new NodeModel(
            node.id,
            node.labels,
            node.properties,
            node.propertyTypes
          )
      )
    )
    vGraph.addRelationships(
      relationships.map(relationship => {
        const source = vGraph.findNodeById(
          relationship.startNodeId
        ) as NodeModel
        const target = vGraph.findNodeById(relationship.endNodeId) as NodeModel
        return new RelationshipModel(
          relationship.id,
          source,
          target,
          relationship.type,
          relationship.properties,
          relationship.propertyTypes
        )
      })
    )
    console.log(vGraph.getNodes(), vGraph.getRelationships())

    const geometry = new Geometry(vGraph)
    const updateGeometry = (nodeId?: string) => {
      geometry.layoutRelationships(nodeId)
      // vGraph
      //   .getRelationships()
      //   .forEach(r => console.log(r.id, r.arrow?.outline(0)))
    }

    const updateLayout = (nodeId?: string) => {
      // centralise nodes in the view by normalising node positions
      // initGraphView && layout.normaliseNodePositions()

      const vNodes = nodeId
        ? [vGraph.findNodeById(nodeId) as NodeModel]
        : vGraph.getNodes()
      const vRelationships = nodeId
        ? vGraph
            .getNodePairsByNodeId(nodeId)
            .reduce(
              (previousValue, currentValue) =>
                previousValue.concat(currentValue.relationships),
              [] as RelationshipModel[]
            )
        : vGraph.getRelationships()

      vNodes.forEach(node => {
        const nodeGfx = nodeDataToNodeGfx.get(node) as Container
        nodeGfx.x = node.x
        nodeGfx.y = node.y
      })

      vRelationships.forEach(relationship => {
        const relationshipGfx = relationshipDataToRelationshipGfx.get(
          relationship
        ) as Container
        // const line = relationshipGfx.getChildByName(LINE_NAME) as Sprite

        // const lineLength = Math.max(
        //   Math.sqrt(
        //     (relationship.target.x - relationship.source.x) ** 2 +
        //       (relationship.target.y - relationship.source.y) ** 2
        //   ) -
        //     NODE_BORDER_RADIUS * 2,
        //   0
        // )

        const arrow = relationshipGfx.getChildByName('ARROW_NAME') as Graphics
        arrow.clear()
        drawArrowBySvgPath(
          arrow,
          relationship.arrow?.outline(0),
          colorToNumber(style.forRelationship(relationship).get('color'))
        )

        relationshipGfx.x = relationship.source.x
        relationshipGfx.y = relationship.source.y
        relationshipGfx.rotation = Math.atan2(
          relationship.target.y - relationship.source.y,
          relationship.target.x - relationship.source.x
        )
        // line.width = lineLength
      })
    }

    const updateVisualisation = (nodeId?: string) => {
      updateGeometry(nodeId)
      updateLayout(nodeId)
    }

    const forceSimulation = new ForceSimulation(vGraph, updateVisualisation)
    const layout = new Layout(vGraph, SCREEN_WIDTH, SCREEN_HEIGHT)
    const style = new GraphStyleModel()

    const { worldWidth: WORLD_WIDTH, worldHeight: WORLD_HEIGHT } =
      layout.initViewportDimension()

    // create PIXI application
    const app = new Application({
      width: SCREEN_WIDTH,
      height: SCREEN_HEIGHT,
      resolution: RESOLUTION,
      // backgroundColor: 0xffff,
      backgroundAlpha: 0,
      antialias: true,
      autoDensity: true
      // autoStart: false // disable automatic rendering by ticker, render manually instead, only when needed
    })
    app.view.style.width = `${SCREEN_WIDTH}px`
    const interactionManager = new InteractionManager(app.renderer)

    // manual rendering
    // app.renderer.on('postrender', () => { console.log('render'); });
    let renderRequestId: number | undefined = undefined
    const requestRender = () => {
      if (renderRequestId) {
        return
      }
      renderRequestId = window.requestAnimationFrame(() => {
        app.render()
        renderRequestId = undefined
      })
    }

    // create PIXI viewport
    const viewport = new Viewport({
      screenWidth: SCREEN_WIDTH,
      screenHeight: SCREEN_HEIGHT,
      worldWidth: WORLD_WIDTH,
      worldHeight: WORLD_HEIGHT,
      interaction: interactionManager
    })
    app.stage.addChild(viewport)
    viewport.drag().pinch().wheel().decelerate()
    // .clampZoom({ minWidth: SCREEN_WIDTH, minHeight: SCREEN_HEIGHT })

    const relationshipsLayer = new Container()
    viewport.addChild(relationshipsLayer)
    const nodesLayer = new Container()
    viewport.addChild(nodesLayer)

    let nodeDataToNodeGfx = new WeakMap()
    const nodeGfxToNodeData = new WeakMap()
    let relationshipDataToRelationshipGfx = new WeakMap()

    const eventHandler = new EventHandler(
      app,
      viewport,
      interactionManager,
      forceSimulation.simulation,
      nodeGfxToNodeData,
      updateVisualisation,
      vGraph.getRelationships().length < 1000
    )

    // create textures: circle, circle border, icons
    const circleGraphics = new Graphics()
    circleGraphics.beginFill(TEXTURE_COLOR)
    circleGraphics.drawCircle(NODE_RADIUS, NODE_RADIUS, NODE_RADIUS)
    const circleTexture = app.renderer.generateTexture(circleGraphics, {
      scaleMode: settings.SCALE_MODE,
      resolution: RESOLUTION * 4
    })

    // create node graphics
    const nodeDataGfxPairs = vGraph.getNodes().map(node => {
      const nodeGfx = new Container()
      nodeGfx.interactive = true
      nodeGfx.buttonMode = true
      nodeGfx.hitArea = new Circle(0, 0, NODE_HIT_RADIUS)
      // nodeGfx.on('mouseover', event => hoverNode(nodeGfxToNodeData.get(event.currentTarget)));
      // nodeGfx.on('mouseout', event => unhoverNode(nodeGfxToNodeData.get(event.currentTarget)));
      eventHandler.bindNodeClickEvent(nodeGfx)
      eventHandler.bindNodeReleaseEvent(nodeGfx)

      const circle = new Sprite(circleTexture)
      // circle.name = CIRCLE;
      circle.x = -circle.width / 2
      circle.y = -circle.height / 2
      // circle.tint = colorToNumber(color(nodeData));
      // console.log(style.forNode(node).get('color'))
      circle.tint = colorToNumber(style.forNode(node).get('color'))
      nodeGfx.addChild(circle)

      nodesLayer.addChild(nodeGfx)

      return [node, nodeGfx]
    })

    const drawArrowBySvgPath = (
      arrow: Graphics,
      svgPath: string | undefined,
      color: number
    ): void => {
      if (!svgPath) return
      const pathData = svgPathParser(svgPath)
      arrow.beginFill(color)
      for (let i = 0; i < pathData.length; i++) {
        switch (pathData[i].type) {
          case 'm':
            arrow.moveTo(pathData[i]['x'] as number, pathData[i]['y'] as number)
            break
          case 'l':
            arrow.lineTo(pathData[i]['x'] as number, pathData[i]['y'] as number)
            break
          case 'a': {
            const bezierSegments = arcToCurve(
              pathData[i - 1]['x'] as number,
              pathData[i - 1]['y'] as number,
              pathData[i]['rx'] as number,
              pathData[i]['ry'] as number,
              pathData[i]['xRotation'] as number,
              pathData[i]['largeArc'] as number,
              pathData[i]['sweep'] as number,
              pathData[i]['x'] as number,
              pathData[i]['y'] as number
            )
            bezierSegments.forEach(bezierSegment =>
              arrow.bezierCurveTo(
                bezierSegment['x1'] as number,
                bezierSegment['y1'] as number,
                bezierSegment['x2'] as number,
                bezierSegment['y2'] as number,
                bezierSegment['x'],
                bezierSegment['y']
              )
            )
            break
          }
          case 'z':
            arrow.closePath()
            break
          default:
            break
        }
      }
      arrow.endFill()
    }

    // create relationship graphics
    const relationshipDataGfxPairs = vGraph
      .getRelationships()
      .map(relationship => {
        // const relationshipLength = Math.max(
        //   Math.sqrt(
        //     (relationship.target.x - relationship.source.x) ** 2 +
        //       (relationship.target.y - relationship.source.y) ** 2
        //   ) -
        //     NODE_BORDER_RADIUS * 2,
        //   0
        // )
        const relationshipGfx = new Container()
        relationshipGfx.x = relationship.source.x
        relationshipGfx.y = relationship.source.y
        relationshipGfx.pivot.set(0, relationshipSize / 2)
        relationshipGfx.rotation = Math.atan2(
          relationship.target.y - relationship.source.y,
          relationship.target.x - relationship.source.x
        )
        relationshipGfx.interactive = true
        relationshipGfx.buttonMode = true
        // relationshipGfx.on('mouseover', event => hoverLink(linkGfxToLinkData.get(event.currentTarget)));
        // relationshipGfx.on('mouseout', event => unhoverLink(linkGfxToLinkData.get(event.currentTarget)));

        // const line = new Sprite(Texture.WHITE)
        // line.name = LINE_NAME
        // line.x = NODE_BORDER_RADIUS
        // line.y = -relationshipSize / 2
        // line.width = relationshipLength
        // line.height = relationshipSize
        // line.tint = 0x0000
        // relationshipGfx.addChild(line)

        const arrow = new Graphics()
        arrow.name = 'ARROW_NAME'
        drawArrowBySvgPath(
          arrow,
          relationship.arrow?.outline(0),
          colorToNumber(style.forRelationship(relationship).get('color'))
        )
        relationshipGfx.addChild(arrow)

        relationshipsLayer.addChild(relationshipGfx)

        return [relationship, relationshipGfx]
      })

    nodeDataToNodeGfx = new WeakMap(
      nodeDataGfxPairs.map(([nodeData, nodeGfx]) => [nodeData, nodeGfx])
    )

    nodeDataGfxPairs.forEach(([nodeData, nodeGfx]) =>
      nodeGfxToNodeData.set(nodeGfx, nodeData)
    )

    relationshipDataToRelationshipGfx = new WeakMap(
      relationshipDataGfxPairs.map(([relationshipData, relationshipGfx]) => [
        relationshipData,
        relationshipGfx
      ])
    )

    const updateVisibility = () => {
      // culling
      const cull = new Cull()
      cull.addAll(nodesLayer.children)
      cull.addAll(relationshipsLayer.children)
      cull.cull(app.renderer.screen)
    }

    // initial layout
    forceSimulation.simulateNodes()
    forceSimulation.simulateRelationships()
    vGraph.getRelationships().length > 1000
      ? forceSimulation.precompute()
      : forceSimulation.restart()

    const resetViewport = () => {
      // const {minNodeX, maxNodeX, minNodeY, maxNodeY} = layout.getBoundaries()
      // viewport.center = new Point(
      //   (maxNodeX - minNodeX) / 2,
      //   (maxNodeY - minNodeY) / 2
      // )
      viewport.fitWorld(true)
      // viewport.setZoom(1)
    }

    // initial draw
    resetViewport()

    viewport.on('frame-end', () => {
      if (viewport.dirty) {
        updateVisibility()
        requestRender()
        viewport.dirty = false
      }
    })

    // prevent body scrolling
    app.view.addEventListener('wheel', event => {
      event.preventDefault()
    })
    app.render()

    if (canvasContainer.current) canvasContainer.current.appendChild(app.view)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <div ref={canvasContainer}></div>
}
