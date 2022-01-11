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
import { VizItem } from './components/types'
import Graph from './lib/visualization/components/Graph'
import GraphView from './lib/visualization/components/GraphView'
import Relationship from './lib/visualization/components/Relationship'
import VizNode from './lib/visualization/components/VizNode'
import { GraphStats, getGraphStats, mapNodes, mapRelationships } from './mapper'
import { BasicNode, BasicNodesAndRels } from 'services/bolt/boltMappings'

export type GetNodeNeighboursFn = (
  node: BasicNode | VizNode,
  currentNeighbourIds: string[],
  callback: (data: BasicNodesAndRels) => void
) => void

export class GraphEventHandler {
  getNodeNeighbours: GetNodeNeighboursFn
  graph: Graph
  graphView: GraphView
  onGraphModelChange: (stats: GraphStats) => void
  onItemMouseOver: (item: VizItem) => void
  onItemSelected: (item: VizItem) => void
  selectedItem: VizNode | Relationship | null
  filterNodeNeighbours: (
    node: { id: string },
    selection: string[],
    callback: Function
  ) => void
  constructor(
    graph: Graph,
    graphView: GraphView,
    getNodeNeighbours: GetNodeNeighboursFn,
    onItemMouseOver: (item: VizItem) => void,
    onItemSelected: (item: VizItem) => void,
    onGraphModelChange: (stats: GraphStats) => void,
    filterNodeNeighbours: GraphEventHandler['filterNodeNeighbours']
  ) {
    this.graph = graph
    this.graphView = graphView
    this.getNodeNeighbours = getNodeNeighbours
    this.selectedItem = null
    this.onItemMouseOver = onItemMouseOver
    this.onItemSelected = onItemSelected
    this.onGraphModelChange = onGraphModelChange
    this.filterNodeNeighbours = filterNodeNeighbours
  }

  graphModelChanged(): void {
    this.onGraphModelChange(getGraphStats(this.graph))
  }

  selectItem(item: VizNode | Relationship): void {
    if (this.selectedItem) {
      this.selectedItem.selected = false
    }
    this.selectedItem = item
    item.selected = true
    this.graphView.update({ updateNodes: true, updateRelationships: true })
  }

  deselectItem(): void {
    if (this.selectedItem) {
      this.selectedItem.selected = false
      this.selectedItem = null
    }
    this.onItemSelected({
      type: 'canvas',
      item: {
        nodeCount: this.graph.nodes().length,
        relationshipCount: this.graph.relationships().length
      }
    })
    this.graphView.update({ updateNodes: true, updateRelationships: true })
  }

  nodeClose(d: VizNode): void {
    this.graph.removeConnectedRelationships(d)
    this.graph.removeNode(d)
    this.deselectItem()
    this.graphView.update({ updateNodes: true, updateRelationships: true })
    this.graphModelChanged()
  }

  nodeClicked(node: VizNode): void {
    if (!node) {
      return
    }
    node.fixed = true
    if (!node.selected) {
      this.selectItem(node)
      this.onItemSelected({
        type: 'node',
        item: node
      })
    } else {
      this.deselectItem()
    }
  }

  nodeUnlock(d: VizNode): void {
    if (!d) {
      return
    }
    d.fixed = false
    this.deselectItem()
  }
  nodeFilterClicked(d: any) {
    const graph = this.graph
    const graphView = this.graphView
    const graphModelChanged = this.graphModelChanged.bind(this)
    this.filterNodeNeighbours(
      d,
      this.graph.findAllRelationshipToNode(d).map((t: any) => t.id),
      (err: any, { nodes, relationships }: any) => {
        if (err) return
        const toDelete: string[] = this.graph
          .findNodeNeighbourIds(d.id)
          .filter(
            (id: string) =>
              nodes.find((t: { id: string }) => t.id === id) === undefined
          )
        if (toDelete.length > 0) {
          toDelete.forEach(id => {
            const node = this.graph.findNode(id)
            this.graph.removeConnectedRelationships(node)
            this.graph.removeNode(node)
          })
        }
        graph.addExpandedNodes(d, mapNodes(nodes))
        graph.addRelationships(mapRelationships(relationships, graph))
        graphView.update({ updateNodes: true, updateRelationships: true })
        graphModelChanged()
      }
    )
  }
  nodeDblClicked(d: VizNode): void {
    if (d.expanded) {
      this.nodeCollapse(d)
      return
    }
    d.expanded = true
    const graph = this.graph
    const graphView = this.graphView
    const graphModelChanged = this.graphModelChanged.bind(this)
    this.getNodeNeighbours(
      d,
      this.graph.findNodeNeighbourIds(d.id),
      ({ nodes, relationships }) => {
        graph.addExpandedNodes(d, mapNodes(nodes))
        graph.addRelationships(mapRelationships(relationships, graph))
        graphView.update({ updateNodes: true, updateRelationships: true })
        graphModelChanged()
      }
    )
  }

  nodeCollapse(d: VizNode): void {
    d.expanded = false
    this.graph.collapseNode(d)
    this.graphView.update({ updateNodes: true, updateRelationships: true })
    this.graphModelChanged()
  }

  onNodeMouseOver(node: VizNode): void {
    if (!node.contextMenu) {
      this.onItemMouseOver({
        type: 'node',
        item: node
      })
    }
  }

  onMenuMouseOver(itemWithMenu: VizNode): void {
    if (!itemWithMenu.contextMenu) {
      throw new Error('menuMouseOver triggered without menu')
    }
    this.onItemMouseOver({
      type: 'context-menu-item',
      item: {
        label: itemWithMenu.contextMenu.label,
        content: itemWithMenu.contextMenu.menuContent,
        selection: itemWithMenu.contextMenu.menuSelection
      }
    })
  }

  onRelationshipMouseOver(relationship: Relationship): void {
    this.onItemMouseOver({
      type: 'relationship',
      item: relationship
    })
  }

  onRelationshipClicked(relationship: Relationship): void {
    if (!relationship.selected) {
      this.selectItem(relationship)
      this.onItemSelected({
        type: 'relationship',
        item: relationship
      })
    } else {
      this.deselectItem()
    }
  }

  onCanvasClicked(): void {
    this.deselectItem()
  }

  onItemMouseOut(): void {
    this.onItemMouseOver({
      type: 'canvas',
      item: {
        nodeCount: this.graph.nodes().length,
        relationshipCount: this.graph.relationships().length
      }
    })
  }

  bindEventHandlers(): void {
    this.graphView
      .on('nodeMouseOver', this.onNodeMouseOver.bind(this))
      .on('nodeMouseOut', this.onItemMouseOut.bind(this))
      .on('menuMouseOver', this.onMenuMouseOver.bind(this))
      .on('menuMouseOut', this.onItemMouseOut.bind(this))
      .on('relMouseOver', this.onRelationshipMouseOver.bind(this))
      .on('relMouseOut', this.onItemMouseOut.bind(this))
      .on('relationshipClicked', this.onRelationshipClicked.bind(this))
      .on('canvasClicked', this.onCanvasClicked.bind(this))
      .on('nodeClose', this.nodeClose.bind(this))
      .on('nodeClicked', this.nodeClicked.bind(this))
      .on('nodeDblClicked', this.nodeDblClicked.bind(this))
      .on('nodeFilterClicked', this.nodeFilterClicked.bind(this))
      .on('nodeUnlock', this.nodeUnlock.bind(this))
    this.onItemMouseOut()
  }
}
