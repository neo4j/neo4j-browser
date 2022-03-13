import { BasicNode, BasicRelationship } from 'common'
import { uniqBy } from 'lodash-es'
import React, { useEffect, useRef } from 'react'

import ExternalEventHandler from '../eventHandler/ExternalEventHandler'
import { GraphModel } from '../models/Graph'
import { GraphStyleModel } from '../models/GraphStyle'
import { ExpandNodeHandler, VItem } from '../types'
import { mapNodes, mapRelationships } from '../utils/mapper'
import Visualisation from '../visualization/Visualisation'

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
