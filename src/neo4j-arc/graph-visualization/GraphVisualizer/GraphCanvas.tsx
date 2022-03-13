import { Cull } from '@pixi-essentials/cull'
import deepmerge from 'deepmerge'
import { BasicNode, BasicRelationship } from 'neo4j-arc/common'
import { uniqBy } from 'lodash-es'
import { Viewport } from 'pixi-viewport'
import {
  Application,
  Circle,
  Container,
  Graphics,
  InteractionManager,
  Point,
  Sprite,
  Text,
  Texture,
  settings
} from 'pixi.js'
import React, { useEffect, useRef } from 'react'
import EventHandler from '../eventHandler/EventHandler'
import ExternalEventHandler from '../eventHandler/ExternalEventHandler'
import ForceSimulation from '../forceSimulation/ForceSimulation'

import Geometry from '../geometry/Geometry'
import Layout from '../layout/Layout'
import { GraphModel } from '../models/Graph'
import { GraphStyleModel } from '../models/GraphStyle'
import { NodeModel } from '../models/Node'
import { RelationshipModel } from '../models/Relationship'
import { ExpandNodeHandler, VItem } from '../types'
import { mapNodes, mapRelationships } from '../utils/mapper'
import { arcToCurve, svgPathParser } from '../utils/svgPathResolver'
import Visualisation from '../visualization/Visualisation'

const SCREEN_WIDTH = 600
const SCREEN_HEIGHT = 400
const RESOLUTION = window.devicePixelRatio

const TEXTURE_COLOR = 0xffffff
const NODE_RADIUS = 25
const NODE_BORDER_WIDTH = 2
const NODE_BORDER_RADIUS = NODE_RADIUS + NODE_BORDER_WIDTH
const NODE_HIT_RADIUS = 25
const ARROW_NAME = 'ARROW'
const relationshipSize = 2
const CAPTION_NAME = 'CAPTION'
const LABEL_COLOR = 0xffffff

const colorToNumber = (color: string) => parseInt(color.slice(1), 16)

type GraphCanvasProps = {
  nodes: BasicNode[]
  relationships: BasicRelationship[]
  styleVersion: number
  style: GraphStyleModel
  setGraphModel: (graph: GraphModel) => void
  autoCompleteRelationships: (
    callback: (internalRelationships: BasicRelationship[]) => void
  ) => void
  onItemSelect: (item: VItem) => void
  onItemMouseOver: (item: VItem) => void
  onExpandNode: ExpandNodeHandler
}

export const GraphCanvas = (props: GraphCanvasProps): JSX.Element => {
  const {
    nodes,
    relationships,
    styleVersion,
    style,
    setGraphModel,
    autoCompleteRelationships,
    onItemSelect,
    onItemMouseOver,
    onExpandNode
  } = props

  const canvasContainer = useRef<HTMLDivElement>(null)
  const graph = useRef(new GraphModel())
  const visualisation = useRef<Visualisation | null>(null)
  console.log('style version', styleVersion)

  useEffect(() => {
    graph.current.addNodes(mapNodes(nodes))
    graph.current.addRelationships(
      mapRelationships(relationships, graph.current)
    )
    setGraphModel(graph.current)
    console.log(graph.current.getNodes(), graph.current.getRelationships())

    const externalEventHandler = new ExternalEventHandler(
      onItemSelect,
      onItemMouseOver,
      onExpandNode
    )

    // const geometry = new Geometry(vGraph, style)
    // const updateGeometry = (nodeId?: string) => {
    //   geometry.pairwiseArcsRelationshipRouting.layoutRelationships(nodeId)
    //   // vGraph
    //   //   .getRelationships()
    //   //   .forEach(r => console.log(r.id, r.shortCaptionLength, r.shortCaption))
    // }

    // const getZoomStep = () => {
    //   const zoom = viewport.scale.x
    //   const zoomSteps = [0.1, 0.2, 0.4, Infinity]
    //   const zoomStep = zoomSteps.findIndex(zoomStep => zoom <= zoomStep)
    //   return zoomStep
    // }

    // const updateLayout = (nodeId?: string) => {
    //   // centralise nodes in the view by normalising node positions
    //   // initGraphView && layout.normaliseNodePositions()

    //   const vNodes = nodeId
    //     ? [vGraph.findNodeById(nodeId) as NodeModel]
    //     : vGraph.getNodes()
    //   const vRelationships = nodeId
    //     ? vGraph
    //         .getNodePairsByNodeId(nodeId)
    //         .reduce(
    //           (previousValue, currentValue) =>
    //             previousValue.concat(currentValue.relationships),
    //           [] as RelationshipModel[]
    //         )
    //     : vGraph.getRelationships()

    //   vNodes.forEach(node => {
    //     const nodeShapeGfx = nodeDataToNodeShapeGfx.get(node) as Container
    //     nodeShapeGfx.x = node.x
    //     nodeShapeGfx.y = node.y

    //     const nodeCaptionGfx = nodeDataToNodeCaptionGfx.get(node) as Container
    //     nodeCaptionGfx.x = node.x
    //     nodeCaptionGfx.y = node.y
    //   })

    //   vRelationships.forEach(relationship => {
    //     const relationshipGfx = relationshipDataToRelationshipGfx.get(
    //       relationship
    //     ) as Container
    //     // const line = relationshipGfx.getChildByName(LINE_NAME) as Sprite

    //     // const lineLength = Math.max(
    //     //   Math.sqrt(
    //     //     (relationship.target.x - relationship.source.x) ** 2 +
    //     //       (relationship.target.y - relationship.source.y) ** 2
    //     //   ) -
    //     //     NODE_BORDER_RADIUS * 2,
    //     //   0
    //     // )

    //     const arrow = relationshipGfx.getChildByName(ARROW_NAME) as Graphics
    //     arrow.clear()
    //     drawArrowBySvgPath(
    //       arrow,
    //       relationship.arrow?.outline(
    //         getZoomStep() >= 3 ? relationship.shortCaptionLength : 0
    //       ),
    //       colorToNumber(style.forRelationship(relationship).get('color'))
    //     )

    //     relationshipGfx.x = relationship.source.x
    //     relationshipGfx.y = relationship.source.y
    //     relationshipGfx.rotation = Math.atan2(
    //       relationship.target.y - relationship.source.y,
    //       relationship.target.x - relationship.source.x
    //     )
    //     // line.width = lineLength

    //     // const relationshipCaptionGfx = relationshipDataToRelationshipCaptionGfx.get(relationship) as Container
    //     const caption = relationshipGfx.getChildByName(CAPTION_NAME) as Text
    //     caption.text = relationship.shortCaption
    //     caption.pivot.x = caption.width / 2
    //     caption.pivot.y = caption.height / 2
    //     caption.x = relationship.arrow?.midShaftPoint?.x ?? 0
    //     caption.y = relationship.arrow?.midShaftPoint?.y ?? 0
    //     caption.rotation =
    //       relationship.naturalAngle < 90 || relationship.naturalAngle > 270
    //         ? 135
    //         : 0
    //   })
    // }

    // const updateVisualisation = (nodeId?: string) => {
    //   updateGeometry(nodeId)
    //   updateLayout(nodeId)
    // }

    // const forceSimulation = new ForceSimulation(vGraph, updateVisualisation)
    // const layout = new Layout(vGraph, SCREEN_WIDTH, SCREEN_HEIGHT)

    // const { worldWidth: WORLD_WIDTH, worldHeight: WORLD_HEIGHT } =
    //   layout.initViewportDimension()

    // // create PIXI application
    // const app = new Application({
    //   width: SCREEN_WIDTH,
    //   height: SCREEN_HEIGHT,
    //   resolution: RESOLUTION,
    //   // backgroundColor: 0xffff,
    //   backgroundAlpha: 0,
    //   antialias: true,
    //   autoDensity: true
    //   // autoStart: false // disable automatic rendering by ticker, render manually instead, only when needed
    // })
    // app.view.style.width = `${SCREEN_WIDTH}px`
    // const interactionManager = new InteractionManager(app.renderer)

    // // manual rendering
    // // app.renderer.on('postrender', () => { console.log('render'); });
    // let renderRequestId: number | undefined = undefined
    // const requestRender = () => {
    //   if (renderRequestId) {
    //     return
    //   }
    //   renderRequestId = window.requestAnimationFrame(() => {
    //     app.render()
    //     renderRequestId = undefined
    //   })
    // }

    // // create PIXI viewport
    // const viewport = new Viewport({
    //   screenWidth: SCREEN_WIDTH,
    //   screenHeight: SCREEN_HEIGHT,
    //   worldWidth: WORLD_WIDTH,
    //   worldHeight: WORLD_HEIGHT,
    //   interaction: interactionManager
    // })
    // app.stage.addChild(viewport)
    // viewport.drag().pinch().wheel().decelerate()
    // // .clampZoom({ minWidth: SCREEN_WIDTH, minHeight: SCREEN_HEIGHT })

    // const relationshipsLayer = new Container()
    // viewport.addChild(relationshipsLayer)
    // const nodesLayer = new Container()
    // viewport.addChild(nodesLayer)

    // const nodeDataToNodeShapeGfx = new WeakMap()
    // const nodeDataToNodeCaptionGfx = new WeakMap()
    // const nodeShapeGfxToNodeData = new WeakMap()
    // const relationshipDataToRelationshipGfx = new WeakMap()

    // const eventHandler = new EventHandler(
    //   app,
    //   viewport,
    //   interactionManager,
    //   forceSimulation.simulation,
    //   nodeShapeGfxToNodeData,
    //   updateVisualisation,
    //   vGraph.getRelationships().length + vGraph.getNodes().length < 1000,
    //   externalEventHandler
    // )

    // // create textures: circle, circle border, icons
    // const circleGraphics = new Graphics()
    // circleGraphics.beginFill(TEXTURE_COLOR)
    // circleGraphics.drawCircle(NODE_RADIUS, NODE_RADIUS, NODE_RADIUS)
    // const circleTexture = app.renderer.generateTexture(circleGraphics, {
    //   scaleMode: settings.SCALE_MODE,
    //   resolution: RESOLUTION * 4
    // })

    // // create node graphics
    // const nodeDataGfxPairs = vGraph.getNodes().map(node => {
    //   const nodeShapeGfx = new Container()
    //   nodeShapeGfx.interactive = true
    //   nodeShapeGfx.buttonMode = true
    //   nodeShapeGfx.hitArea = new Circle(0, 0, NODE_HIT_RADIUS)
    //   // nodeGfx.on('mouseover', event => hoverNode(nodeGfxToNodeData.get(event.currentTarget)));
    //   // nodeGfx.on('mouseout', event => unhoverNode(nodeGfxToNodeData.get(event.currentTarget)));
    //   eventHandler.bindNodeHoverEvent(nodeShapeGfx)
    //   eventHandler.bindNodeClickEvent(nodeShapeGfx)
    //   eventHandler.bindNodeReleaseEvent(nodeShapeGfx)

    //   const circle = new Sprite(circleTexture)
    //   // circle.name = CIRCLE;
    //   circle.x = -circle.width / 2
    //   circle.y = -circle.height / 2
    //   // circle.tint = colorToNumber(color(nodeData));
    //   // console.log(style.forNode(node).get('color'))
    //   circle.tint = colorToNumber(style.forNode(node).get('color'))
    //   nodeShapeGfx.addChild(circle)

    //   nodesLayer.addChild(nodeShapeGfx)

    //   const nodeCaptionGfx = new Container()
    //   nodeCaptionGfx.x = node.x
    //   nodeCaptionGfx.y = node.y
    //   // captionGfx.interactive = true;
    //   // captionGfx.buttonMode = true;
    //   // captionGfx.on('mouseover', event => hoverNode(labelGfxToNodeData.get(event.currentTarget)));
    //   // captionGfx.on('mouseout', event => unhoverNode(labelGfxToNodeData.get(event.currentTarget)));
    //   // captionGfx.on('mousedown', event => clickNode(labelGfxToNodeData.get(event.currentTarget)));
    //   // captionGfx.on('mouseup', () => unclickNode());
    //   // captionGfx.on('mouseupoutside', () => unclickNode());

    //   // const caption = new BitmapText(/* LABEL_TEXT(nodeData) */'TEST', {
    //   //   // font: {
    //   //   //   name: LABEL_FONT_FAMILY,
    //   //   //   size: LABEL_FONT_SIZE
    //   //   // },
    //   //   fontName: "Arial",
    //   //   align: 'center',
    //   //   tint: LABEL_COLOR
    //   // });
    //   geometry.formatNodeCaption(node)
    //   const caption = new Text(
    //     node.caption.map(captionLine => captionLine.text).join('\n'),
    //     {
    //       fontFamily: 'sans-serif',
    //       fontSize: parseFloat(style.forNode(node).get('font-size')),
    //       fill: colorToNumber(style.forNode(node).get('text-color-internal')),
    //       align: 'center'
    //     }
    //   )
    //   caption.resolution = RESOLUTION * 4
    //   caption.name = CAPTION_NAME
    //   caption.x = -caption.width / 2
    //   caption.y = -caption.height / 2
    //   nodeCaptionGfx.addChild(caption)

    //   nodesLayer.addChild(nodeCaptionGfx)

    //   return { node, nodeShapeGfx, nodeCaptionGfx }
    // })

    // const drawArrowBySvgPath = (
    //   arrow: Graphics,
    //   svgPath: string | undefined,
    //   color: number
    // ): void => {
    //   if (!svgPath) return
    //   const pathData = svgPathParser(svgPath)
    //   arrow.beginFill(color)
    //   for (let i = 0; i < pathData.length; i++) {
    //     switch (pathData[i].type) {
    //       case 'm':
    //         arrow.moveTo(pathData[i]['x'] as number, pathData[i]['y'] as number)
    //         break
    //       case 'l':
    //         arrow.lineTo(pathData[i]['x'] as number, pathData[i]['y'] as number)
    //         break
    //       case 'a': {
    //         const bezierSegments = arcToCurve(
    //           pathData[i - 1]['x'] as number,
    //           pathData[i - 1]['y'] as number,
    //           pathData[i]['rx'] as number,
    //           pathData[i]['ry'] as number,
    //           pathData[i]['xRotation'] as number,
    //           pathData[i]['largeArc'] as number,
    //           pathData[i]['sweep'] as number,
    //           pathData[i]['x'] as number,
    //           pathData[i]['y'] as number
    //         )
    //         bezierSegments.forEach(bezierSegment =>
    //           arrow.bezierCurveTo(
    //             bezierSegment['x1'] as number,
    //             bezierSegment['y1'] as number,
    //             bezierSegment['x2'] as number,
    //             bezierSegment['y2'] as number,
    //             bezierSegment['x'],
    //             bezierSegment['y']
    //           )
    //         )
    //         break
    //       }
    //       case 'z':
    //         arrow.closePath()
    //         break
    //       default:
    //         break
    //     }
    //   }
    //   arrow.endFill()
    // }

    // // create relationship graphics
    // const relationshipDataGfxPairs = vGraph
    //   .getRelationships()
    //   .map(relationship => {
    //     // const relationshipLength = Math.max(
    //     //   Math.sqrt(
    //     //     (relationship.target.x - relationship.source.x) ** 2 +
    //     //       (relationship.target.y - relationship.source.y) ** 2
    //     //   ) -
    //     //     NODE_BORDER_RADIUS * 2,
    //     //   0
    //     // )

    //     geometry.formatRelationshipCaption(relationship)
    //     geometry.pairwiseArcsRelationshipRouting.measureRelationshipCaption(
    //       relationship
    //     )

    //     const relationshipGfx = new Container()
    //     // relationshipShapeGfx.x = relationship.source.x
    //     // relationshipShapeGfx.y = relationship.source.y
    //     relationshipGfx.pivot.set(0, relationshipSize / 2)
    //     // relationshipShapeGfx.rotation = Math.atan2(
    //     //   relationship.target.y - relationship.source.y,
    //     //   relationship.target.x - relationship.source.x
    //     // )
    //     relationshipGfx.interactive = true
    //     relationshipGfx.buttonMode = true
    //     // relationshipGfx.on('mouseover', event => hoverLink(linkGfxToLinkData.get(event.currentTarget)));
    //     // relationshipGfx.on('mouseout', event => unhoverLink(linkGfxToLinkData.get(event.currentTarget)));

    //     // const line = new Sprite(Texture.WHITE)
    //     // line.name = LINE_NAME
    //     // line.x = NODE_BORDER_RADIUS
    //     // line.y = -relationshipSize / 2
    //     // line.width = relationshipLength
    //     // line.height = relationshipSize
    //     // line.tint = 0x0000
    //     // relationshipGfx.addChild(line)
    //     // relationshipsLayer.addChild(relationshipShapeGfx)

    //     const arrow = new Graphics()
    //     arrow.name = ARROW_NAME
    //     // drawArrowBySvgPath(
    //     //   arrow,
    //     //   relationship.arrow?.outline(0),
    //     //   colorToNumber(style.forRelationship(relationship).get('color'))
    //     // )
    //     relationshipGfx.addChild(arrow)

    //     const caption = new Text(relationship.shortCaption, {
    //       fontSize: parseFloat(
    //         style.forRelationship(relationship).get('font-size')
    //       ),
    //       fill: 0xff1010,
    //       align: 'center'
    //     })
    //     caption.name = CAPTION_NAME
    //     relationshipGfx.addChild(caption)

    //     relationshipsLayer.addChild(relationshipGfx)

    //     return { relationship, relationshipGfx }
    //   })

    // nodeDataGfxPairs.forEach(
    //   ({ node: nodeData, nodeShapeGfx, nodeCaptionGfx }) => {
    //     nodeDataToNodeShapeGfx.set(nodeData, nodeShapeGfx)
    //     nodeDataToNodeCaptionGfx.set(nodeData, nodeCaptionGfx)
    //     nodeShapeGfxToNodeData.set(nodeShapeGfx, nodeData)
    //   }
    // )

    // relationshipDataGfxPairs.forEach(
    //   ({ relationship: relationshipData, relationshipGfx }) => {
    //     relationshipDataToRelationshipGfx.set(relationshipData, relationshipGfx)
    //   }
    // )

    // const updateVisibility = () => {
    //   // culling
    //   const cull = new Cull()
    //   cull.addAll(nodesLayer.children)
    //   cull.addAll(relationshipsLayer.children)
    //   cull.cull(app.renderer.screen)

    //   // levels of detail
    //   vGraph.getNodes().forEach(nodeData => {
    //     const captionGfx = nodeDataToNodeCaptionGfx.get(nodeData)
    //     const caption = captionGfx.getChildByName(CAPTION_NAME)
    //     caption.visible = getZoomStep() >= 3
    //   })

    //   vGraph.getRelationships().forEach(relationshipData => {
    //     const relationshipGfx =
    //       relationshipDataToRelationshipGfx.get(relationshipData)
    //     const arrow = relationshipGfx.getChildByName(ARROW_NAME)
    //     const caption = relationshipGfx.getChildByName(CAPTION_NAME)

    //     arrow.visible = getZoomStep() >= 1
    //     caption.visible = getZoomStep() >= 3
    //     if (getZoomStep() >= 1) {
    //       arrow.clear()
    //       drawArrowBySvgPath(
    //         arrow,
    //         relationshipData.arrow?.outline(
    //           getZoomStep() >= 3 ? relationshipData.shortCaptionLength : 0
    //         ),
    //         colorToNumber(style.forRelationship(relationshipData).get('color'))
    //       )
    //     }
    //   })
    // }

    // // initial layout
    // forceSimulation.simulateNodes()
    // forceSimulation.simulateRelationships()
    // vGraph.getRelationships().length > 1000 || vGraph.getNodes().length > 1000
    //   ? forceSimulation.precompute()
    //   : forceSimulation.restart()

    // const resetViewport = () => {
    //   // const {minNodeX, maxNodeX, minNodeY, maxNodeY} = layout.getBoundaries()
    //   // viewport.center = new Point(
    //   //   (maxNodeX - minNodeX) / 2,
    //   //   (maxNodeY - minNodeY) / 2
    //   // )
    //   viewport.fitWorld(true)
    //   // viewport.setZoom(1)
    // }

    // // initial draw
    // resetViewport()

    // viewport.on('frame-end', () => {
    //   if (viewport.dirty) {
    //     updateVisibility()
    //     requestRender()
    //     viewport.dirty = false
    //   }
    // })

    // // prevent body scrolling
    // app.view.addEventListener('wheel', event => {
    //   event.preventDefault()
    // })
    // app.render()

    visualisation.current = new Visualisation(
      graph.current,
      style,
      externalEventHandler
    )
    visualisation.current.initVisualisation()
    autoCompleteRelationships(internalRelationships => {
      console.log('internal rel', internalRelationships)
      const expandedRelationships = uniqBy(
        mapRelationships(internalRelationships, graph.current),
        'id'
      )
      graph.current.addInternalRelationships(expandedRelationships)
      visualisation.current?.onGraphChange([], expandedRelationships, 'expand')
      // visualisation.current?.initVisualisation()
    })
    if (canvasContainer.current)
      canvasContainer.current.appendChild(visualisation.current.view)
    return () => {
      console.log('destory')
      visualisation.current?.destory()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    console.log('use effect', styleVersion)
    styleVersion > 0 &&
      visualisation.current?.onGraphChange(
        graph.current.getNodes(),
        graph.current.getRelationships(),
        'update'
      )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [styleVersion])

  return <div ref={canvasContainer}></div>
}
