import { Cull } from '@pixi-essentials/cull'
import deepmerge from 'deepmerge'
import { BasicNode, BasicRelationship } from 'neo4j-arc/common'
import { uniqBy } from 'lodash-es'
import React, { useEffect, useRef, useState } from 'react'
import EventHandler from '../eventHandler/EventHandler'
import ExternalEventHandler from '../eventHandler/ExternalEventHandler'
import ForceSimulation from '../forceSimulation/ForceSimulation'

import Geometry from '../geometry/Geometry'
import Layout from '../layout/Layout'
import { GraphModel } from '../models/Graph'
import { GraphStyleModel } from '../models/GraphStyle'
import { ExpandNodeHandler, VItem } from '../types'
import { GraphStats, mapNodes, mapRelationships } from '../utils/mapper'
import Visualisation from '../visualization/Visualisation'
import { ZoomInIcon, ZoomOutIcon, ZoomToFitIcon } from 'neo4j-arc/common'
import { ZOOM_MAX_SCALE } from '../constants'
import { StyledZoomButton, StyledZoomHolder } from './Graph/styled'
import { WheelZoomInfoOverlay } from './Graph/WheelZoomInfoOverlay'

type GraphCanvasProps = {
  isFullscreen: boolean
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
  onGraphModelChange: (stats: GraphStats) => void
  controlButtonOffset: number
  wheelZoomInfoMessageEnabled: boolean
  disableWheelZoomInfoMessage: () => void
}

export const GraphCanvas = (props: GraphCanvasProps): JSX.Element => {
  const {
    isFullscreen,
    nodes,
    relationships,
    styleVersion,
    style,
    setGraphModel,
    autoCompleteRelationships,
    onItemSelect,
    onItemMouseOver,
    onExpandNode,
    onGraphModelChange,
    controlButtonOffset,
    wheelZoomInfoMessageEnabled,
    disableWheelZoomInfoMessage
  } = props

  const canvasContainer = useRef<HTMLDivElement>(null)
  const graph = useRef(new GraphModel())
  const visualisation = useRef<Visualisation | null>(null)
  console.log('style version', styleVersion)

  const [displayWheelZoomInfoMessage, setDisplayWheelZoomInfoMessage] =
    useState(false)

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

    if (canvasContainer.current) {
      visualisation.current = new Visualisation(
        canvasContainer.current,
        graph.current,
        style,
        externalEventHandler,
        onGraphModelChange
      )
      visualisation.current.initVisualisation()
      autoCompleteRelationships(internalRelationships => {
        console.log('internal rel', internalRelationships)
        const expandedRelationships = uniqBy(
          mapRelationships(internalRelationships, graph.current),
          'id'
        )
        graph.current.addInternalRelationships(expandedRelationships)
        visualisation.current?.onGraphChange(
          [],
          expandedRelationships,
          'expand'
        )
      })
      canvasContainer.current.appendChild(visualisation.current.view)
    }
    return () => {
      console.log('destory')
      visualisation.current?.destory()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    visualisation.current?.toggleFullscreen(isFullscreen)
  }, [isFullscreen])

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

  return (
    <>
      <div
        style={{ width: '100%', height: '100%' }}
        ref={canvasContainer}
        onWheel={() => setDisplayWheelZoomInfoMessage(true)}
      ></div>
      <StyledZoomHolder
        offset={controlButtonOffset}
        isFullscreen={isFullscreen}
      >
        <StyledZoomButton
          aria-label={'zoom-in'}
          className={
            visualisation.current &&
            visualisation.current?.zoomScale >= ZOOM_MAX_SCALE
              ? 'faded zoom-in'
              : 'zoom-in'
          }
          onClick={() => visualisation.current?.zoomIn()}
        >
          <ZoomInIcon large={isFullscreen} />
        </StyledZoomButton>
        <StyledZoomButton
          aria-label={'zoom-out'}
          // className={zoomOutLimitReached ? 'faded zoom-out' : 'zoom-out'}
          onClick={() => visualisation.current?.zoomOut()}
        >
          <ZoomOutIcon large={isFullscreen} />
        </StyledZoomButton>
        <StyledZoomButton
          aria-label={'zoom-to-fit'}
          onClick={() => visualisation.current?.resetViewport()}
        >
          <ZoomToFitIcon large={isFullscreen} />
        </StyledZoomButton>
      </StyledZoomHolder>
      {wheelZoomInfoMessageEnabled &&
        !isFullscreen &&
        displayWheelZoomInfoMessage && (
          <WheelZoomInfoOverlay
            onDisableWheelZoomInfoMessage={disableWheelZoomInfoMessage}
          />
        )}
    </>
  )
}
