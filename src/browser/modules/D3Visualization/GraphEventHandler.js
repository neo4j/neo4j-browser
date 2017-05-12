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
    constructor(graph, graphView, getNodeNeighbours, onItemMouseOver, onItemSelected, onGraphModelChange) {
        this.graph = graph
        this.graphView = graphView
        this.getNodeNeighbours = getNodeNeighbours
        this.selectedItem = null
        this.onItemMouseOver = onItemMouseOver
        this.onItemSelected = onItemSelected
        this.onGraphModelChange = onGraphModelChange
    }
    uniqueNodeId(id) {
        var uniqueId = (Number(id) + 1).toString()
        while (this.graph.findNode(uniqueId)) {
            uniqueId = (Number(uniqueId) + 1).toString()
        }
        return uniqueId
    }

    uniqueRelationshipId(id) {
        var uniqueId = (Number(id) + 1).toString()
        while (this.graph.findRelationship(uniqueId)) {
            uniqueId = (Number(uniqueId) + 1).toString()
        }
        return uniqueId
    }


    graphModelChanged() {
        this.onGraphModelChange(getGraphStats(this.graph))
    }

    selectItem(item) {
        if (this.selectedItem) {
            this.selectedItem.selected = false
        }
        this.selectedItem = item
        item.selected = true
        this.graphView.update()
    }

    deselectItem() {
        if (this.selectedItem) {
            this.selectedItem.selected = false
            this.selectedItem = null
        }
        this.onItemSelected({ type: 'canvas', item: { nodeCount: this.graph.nodes().length, relationshipCount: this.graph.relationships().length } })
        this.graphView.update()
    }

    nodeClose(d) {
        this.graph.removeConnectedRelationships(d)
        this.graph.removeNode(d)
        this.deselectItem()
        this.graphView.update()
        this.graphModelChanged()
    }

    nodeClicked(d) {
        d.fixed = true
        if (!d.selected) {
            this.selectItem(d)
            this.onItemSelected({ type: 'node', item: { id: d.id, labels: d.labels, properties: d.propertyList } })

            if (d.labels[0] === "PROPERTY") {
                var nodeId = d.propertyMap.id
                var key = d.propertyMap.key
                var value = d.propertyMap.value
                var keyValue = prompt('Edit the node\'s ' + key + '.', value)
                var cmd = 'match (n) where id(n) = ' + nodeId + ' set n.' + key + ' = \'' + keyValue + '\' return n'
                bolt.directTransaction(cmd)
                d.propertyMap.value = keyValue
                this.deselectItem()
            }

        } else {
            this.deselectItem()
        }
    }

    nodeEdit(d) {
        const graph = this.graph
        const graphView = this.graphView
        const graphModelChanged = this.graphModelChanged.bind(this)

        var nodeId = d.id
        var propertyList = d.propertyList

        /*/node-text
        var keyList = ''
        var defaultKey = ''
        for (var i = propertyList.length - 1; i >= 0; i--) {
            if (propertyList.hasOwnProperty(i)) {
                keyList += propertyList[i].key
                if (i != 0)
                    keyList += '\n'
                if (i == propertyList.length - 1)
                    defaultKey = propertyList[i].key
            }
        }
        var queryKey = prompt('Input the property to edit:\n' + keyList, defaultKey)
        var flag = 0
        for (var i = propertyList.length - 1; i >= 0; i--) {
            if (propertyList[i].key == queryKey) {
                var keyValue = prompt('Edit the node\'s ' + queryKey + '.', queryKey)
                var cmd = 'match (n) where id(n) = ' + nodeId + ' set n.' + queryKey + ' = \'' + keyValue + '\' return n'
                console.log(cmd)
                bolt.directTransaction(cmd)
                d.propertyMap[queryKey] = keyValue
                flag = 1
            }
        }
        if (flag = 0) {
            throw new Error('Invalid property.')
        }
        //*/

        //node-explode
        console.log(this.graph.nodes())
        var hasProperty = false
        var graphNodes = this.graph.nodes()
        for (var i = graphNodes.length - 1; i >= 0; i--) {
            if (graphNodes[i].propertyMap.id === nodeId) {
                console.log(graphNodes[i].propertyMap.id)
                hasProperty = true
                this.nodeClose(graphNodes[i])
            }
        }

        if (hasProperty === false) {
            var propertyNodes = new Array()
            var propertyRelationships = new Array()
            var nextNodeId = nodeId
            var nextRelId = nodeId

            for (var i = propertyList.length - 1; i >= 0; i--) {
                if (propertyList.hasOwnProperty(i)) {

                    var property = new Object()
                    nextNodeId = this.uniqueNodeId(nextNodeId)
                    property.id = nextNodeId
                    property.labels = new Array();
                    property.labels.push('PROPERTY')
                    property.properties = new Object();
                    property.properties.id = nodeId
                    property.properties.key = propertyList[i].key
                    property.properties.value = propertyList[i].value

                    propertyNodes.push(property)

                    var rel = new Object()
                    var nextRelId = this.uniqueRelationshipId(nextNodeId)
                    rel.id = nextRelId
                    rel.type = propertyList[i].key
                    rel.startNodeId = nodeId
                    rel.endNodeId = property.id
                    rel.properties = new Object()

                    propertyRelationships.push(rel)
                }
            }

            graph.addNodes(mapNodes(propertyNodes))
            graph.addRelationships(mapRelationships(propertyRelationships, graph))

        }

        //*/

        d.fixed = true
        graph.updateNode(d)
        this.deselectItem()
        graphView.update()
        graphModelChanged()
    }

    nodeUnlock(d) {
        d.fixed = false
        this.deselectItem()
    }

    nodeDblClicked(d) {
        const graph = this.graph
        const graphView = this.graphView
        const graphModelChanged = this.graphModelChanged.bind(this)
        this.getNodeNeighbours(d, this.graph.findNodeNeighbourIds(d.id), function({ nodes, relationships }) {
            graph.addNodes(mapNodes(nodes))
            graph.addRelationships(mapRelationships(relationships, graph))
            graphView.update()
            graphModelChanged()
        })
    }

    onNodeMouseOver(node) {
        if (!node.contextMenu) {
            this.onItemMouseOver({ type: 'node', item: { id: node.id, labels: node.labels, properties: node.propertyList } })
        }
    }
    onMenuMouseOver(itemWithMenu) {
        this.onItemMouseOver({ type: 'context-menu-item', item: { label: itemWithMenu.contextMenu.label, content: itemWithMenu.contextMenu.menuContent, selection: itemWithMenu.contextMenu.menuSelection } })
    }
    onRelationshipMouseOver(relationship) {
        this.onItemMouseOver({ type: 'relationship', item: { id: relationship.id, type: relationship.type, properties: relationship.propertyList } })
    }

    onRelationshipClicked(relationship) {
        if (!relationship.selected) {
            this.selectItem(relationship)
            this.onItemSelected({ type: 'relationship', item: { id: relationship.id, type: relationship.type, properties: relationship.propertyList } })
        } else {
            this.deselectItem()
        }
    }
    onRelationshipDblClicked(relationship) {
        if (!relationship.selected) {
            this.selectItem(relationship)
            this.onItemSelected({ type: 'relationship', item: { id: relationship.id, type: relationship.type, properties: relationship.propertyList } })

            var targetId = relationship.target.id
            var sourceId = relationship.source.id
            var str = prompt("Edit the relationship's label", 'REL')
            var cmd = 'match (n),(m) where id(n) = ' + sourceId + ' and id(m) = ' + targetId + ' match (n)-[r]->(m) CREATE (n)-[new :' + str + ']->(m) SET new += r DELETE r RETURN n, r, m, new'
            bolt.directTransaction(cmd)
            relationship.type = str

        } else {
            var targetId = relationship.target.id
            var sourceId = relationship.source.id
            var str = prompt("Edit the relationship's label", 'REL')
            var cmd = 'match (n),(m) where id(n) = ' + sourceId + ' and id(m) = ' + targetId + ' match (n)-[r]->(m) CREATE (n)-[new :' + str + ']->(m) SET new += r DELETE r RETURN n, r, m, new'
            bolt.directTransaction(cmd)
            relationship.type = str

            this.deselectItem()
        }
    }

    onCanvasClicked() {
        this.deselectItem()
    }

    onItemMouseOut(item) {
        this.onItemMouseOver({ type: 'canvas', item: { nodeCount: this.graph.nodes().length, relationshipCount: this.graph.relationships().length } })
    }

    bindEventHandlers() {
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
