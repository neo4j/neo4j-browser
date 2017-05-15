/* eslint-disable no-redeclare,no-undef,no-undef */
/*
 * Copyright (c) 2002-2017 "Neo Technology,"
 * Network Engine for Objects in Lund AB [http://neotechnology.com]
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

import { mapNodes, mapRelationships, getGraphStats } from './mapper'
import bolt from 'services/bolt/bolt'

export class GraphEventHandler {
  constructor (graph, graphView, getNodeNeighbours, onItemMouseOver, onItemSelected, onGraphModelChange) {
    this.graph = graph
    this.graphView = graphView
    this.getNodeNeighbours = getNodeNeighbours
    this.selectedItem = null
    this.onItemMouseOver = onItemMouseOver
    this.onItemSelected = onItemSelected
    this.onGraphModelChange = onGraphModelChange
  }

  uniqueNodeId (id) {
    let uniqueId = (Number(id) + 1).toString()
    while (this.graph.findNode(uniqueId)) {
      // console.log('inNodeloop' + uniqueId)
      uniqueId = (Number(uniqueId) + 1).toString()
    }
    return uniqueId
  }

  uniqueRelationshipId (id) {
    let uniqueId = (Number(id) + 1).toString()
    while (this.graph.findRelationship(uniqueId)) {
      // console.log('inRelloop' + uniqueId)
      uniqueId = (Number(uniqueId) + 1).toString()
    }
    return uniqueId
  }

  graphModelChanged () {
    this.onGraphModelChange(getGraphStats(this.graph))
  }

  selectItem (item) {
    if (this.selectedItem) {
      this.selectedItem.selected = false
    }
    this.selectedItem = item
    item.selected = true
    this.graphView.update()
  }

  deselectItem () {
    if (this.selectedItem) {
      this.selectedItem.selected = false
      this.selectedItem = null
    }
    this.onItemSelected({
      type: 'canvas',
      item: {nodeCount: this.graph.nodes().length, relationshipCount: this.graph.relationships().length}
    })
    this.graphView.update()
  }

  nodeClose (d) {
    this.graph.removeConnectedRelationships(d)
    this.graph.removeNode(d)
    let graphNodes = this.graph.nodes()
    for (let i = graphNodes.length - 1; i >= 0; i--) {
      if (graphNodes[i].propertyMap.id === d.id) {
        this.graph.removeConnectedRelationships(graphNodes[i])
        this.graph.removeNode(graphNodes[i])
      }
    }
    this.deselectItem()
    this.graphView.update()
    this.graphModelChanged()
  }

  nodeClicked (d) {
    d.fixed = true
    if (!d.selected) {
      this.selectItem(d)
      this.onItemSelected({type: 'node', item: {id: d.id, labels: d.labels, properties: d.propertyList}})

      if (d.labels[0] === 'PROPERTY') {
        const nodeId = d.propertyMap.id
        const key = d.propertyMap.key
        const value = d.propertyMap.value
        let keyValue = prompt('Edit the node\'s ' + key + '.', value)
        let cmd = 'match (n) where id(n) = ' + nodeId + ' set n.' + key + ' = \'' + keyValue + '\' return n'
        bolt.directTransaction(cmd)
        d.propertyMap.value = keyValue
        this.deselectItem()
        d.fixed = false
      }
    } else {
      this.deselectItem()
    }
  }

  nodeEdit (d) {
    const graph = this.graph
    const graphView = this.graphView
    const graphModelChanged = this.graphModelChanged.bind(this)

    const nodeId = d.id
    const propertyList = d.propertyList
    const graphNodes = this.graph.nodes()

    let hasProperty = false

    for (let i = graphNodes.length - 1; i >= 0; i--) {
      if (graphNodes[i].propertyMap.id === nodeId) {
        hasProperty = true
        this.nodeClose(graphNodes[i])
      }
    }

    if (hasProperty === false) {
      let nextNodeId = nodeId
      let nextRelId = nodeId

      for (let i = propertyList.length - 1; i >= 0; i--) {
        if (propertyList.hasOwnProperty(i)) {
          let propertyNodes = []
          let propertyRelationships = []
          let property = []
          let rel = []

          nextNodeId = this.uniqueNodeId(nextNodeId)
          property.id = nextNodeId
          property.labels = []
          property.labels.push('PROPERTY')
          property.properties = []
          property.properties.id = nodeId
          property.properties.key = propertyList[i].key
          property.properties.value = propertyList[i].value

          propertyNodes.push(property)

          nextRelId = this.uniqueRelationshipId(nextNodeId)
          rel.id = nextRelId
          // console.log(nextRelId)
          rel.type = propertyList[i].key
          rel.startNodeId = nodeId
          rel.endNodeId = property.id
          rel.properties = []

          propertyRelationships.push(rel)

          graph.addNodes(mapNodes(propertyNodes))
          graph.addRelationships(mapRelationships(propertyRelationships, graph))
        }
      }
    }

    d.fixed = true
    graph.updateNode(d)
    this.deselectItem()
    graphView.update()
    graphModelChanged()
  }

  nodeUnlock (d) {
    d.fixed = false
    this.deselectItem()
  }

  nodeDblClicked (d) {
    const graph = this.graph
    const graphView = this.graphView
    const graphModelChanged = this.graphModelChanged.bind(this)
    this.getNodeNeighbours(d, this.graph.findNodeNeighbourIds(d.id), function ({nodes, relationships}) {
      graph.addNodes(mapNodes(nodes))
      graph.addRelationships(mapRelationships(relationships, graph))
      graphView.update()
      graphModelChanged()
    })
  }

  onNodeMouseOver (node) {
    if (!node.contextMenu) {
      this.onItemMouseOver({type: 'node', item: {id: node.id, labels: node.labels, properties: node.propertyList}})
    }
  }

  onMenuMouseOver (itemWithMenu) {
    this.onItemMouseOver({
      type: 'context-menu-item',
      item: {
        label: itemWithMenu.contextMenu.label,
        content: itemWithMenu.contextMenu.menuContent,
        selection: itemWithMenu.contextMenu.menuSelection
      }
    })
  }

  onRelationshipMouseOver (relationship) {
    this.onItemMouseOver({
      type: 'relationship',
      item: {id: relationship.id, type: relationship.type, properties: relationship.propertyList}
    })
  }

  onRelationshipClicked (relationship) {
    if (!relationship.selected) {
      this.selectItem(relationship)
      this.onItemSelected({
        type: 'relationship',
        item: {id: relationship.id, type: relationship.type, properties: relationship.propertyList}
      })
    } else {
      this.deselectItem()
    }
  }

  onRelationshipDblClicked (relationship) {
    if (!relationship.selected) {
      this.selectItem(relationship)
      this.onItemSelected({
        type: 'relationship',
        item: {id: relationship.id, type: relationship.type, properties: relationship.propertyList}
      })

      const targetId = relationship.target.id
      const sourceId = relationship.source.id
      const str = prompt('Edit the relationship\'s label', 'REL')
      const cmd = 'match (n),(m) where id(n) = ' + sourceId + ' and id(m) = ' + targetId + ' match (n)-[r]->(m) CREATE (n)-[new :' + str + ']->(m) SET new += r DELETE r RETURN n, r, m, new'
      bolt.directTransaction(cmd)
      relationship.type = str
    } else {
      const targetId = relationship.target.id
      const sourceId = relationship.source.id
      const str = prompt('Edit the relationship\'s label', 'REL')
      const cmd = 'match (n),(m) where id(n) = ' + sourceId + ' and id(m) = ' + targetId + ' match (n)-[r]->(m) CREATE (n)-[new :' + str + ']->(m) SET new += r DELETE r RETURN n, r, m, new'
      bolt.directTransaction(cmd)
      relationship.type = str

      this.deselectItem()
    }
  }

  onCanvasClicked () {
    this.deselectItem()
  }

  onItemMouseOut (item) {
    this.onItemMouseOver({
      type: 'canvas',
      item: {nodeCount: this.graph.nodes().length, relationshipCount: this.graph.relationships().length}
    })
  }

  bindEventHandlers () {
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
      .on('nodeUnlock', this.nodeUnlock.bind(this))
      .on('nodeEdit', this.nodeEdit.bind(this))
      .on('relationshipDblClicked', this.onRelationshipDblClicked.bind(this))
    this.onItemMouseOut()
  }
}
