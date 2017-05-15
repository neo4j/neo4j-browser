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

import { Component } from 'preact'
import Integer from '../../../../node_modules/neo4j-driver/lib/v1/integer'

export class NevadaWrapper extends Component {
  constructor (props) {
    super(props)
    this.state = {}
  }

  _getDataFromId (id, store) {
    let stringId = Integer.fromString(id)
    var i
    for (i = store.length; i > 0; i--) {
      let obj = store[i - 1]
      let highAndLowSame = obj.identity.low === stringId.low && obj.identity.high === stringId.high
      if (highAndLowSame) {
        return obj
      }
    }
    throw new Error('No data found')
  }

  _getDataFromIds (ids, store) {
    let dataArray = []
    ids.forEach((id) => {
      dataArray.push(this._getDataFromId(id, store))
    })
    return dataArray
  }

  getNeighbours (id) {
    let promise = this.props.getNeighbours(id)
    const mapRecords = (result) => {
      return new Promise((resolve, reject) => {
        resolve({nodes: result.nodes, rels: result.relationships})
      })
    }
    return promise.then(mapRecords)
  }

  fetchLabels () {
    return this.props.labels
  }

  labelsUpdated (labels) {
    return this.props.onLabelsSave(labels)
  }

  updateNodeStyle (style) {
    return this.props.updateNevadaStyle(style)
  }

  updateRelationshipStyle (style) {
    return this.props.updateNevadaRelationships(style)
  }

  getNodes (nodeIds) {
    return new Promise((resolve, reject) => {
      let nodesArray = this._getDataFromIds(nodeIds, this.props.nodes)
      resolve(nodesArray)
    })
  }

  getRels (relIds) {
    return new Promise((resolve, reject) => {
      let relsArray = this._getDataFromIds(relIds, this.props.relationships)
      resolve(relsArray)
    })
  }

  componentWillUnmount () {
    if (this.state.nevada) {
      this.state.nevada.destroy()
    }
  }

  componentDidMount () {
    if (this.state.parentContainer) {
      const callbacks = {
        getNeighbours: this.getNeighbours.bind(this),
        labelsUpdated: this.labelsUpdated.bind(this),
        fetchLabels: this.fetchLabels.bind(this),
        updateNodeStyle: this.updateNodeStyle.bind(this),
        updateRelStyle: this.updateRelationshipStyle.bind(this),
        getNodes: this.getNodes.bind(this),
        getRels: this.getRels.bind(this)
//        clientData:
      }
      require.ensure([], (require) => {
        const Nevada = require('neo4j-visualization').default
        this.state.nevada = new Nevada(this.state.parentContainer, this.props.nodes, this.props.relationships, {fullscreen: this.props.fullscreen}, callbacks)
      }, 'nevada')
    }
  }

  componentWillReceiveProps (nextProps) {
    if (this.state.nevada) {
      this.state.nevada.updateLabels(nextProps.labels)
      this.state.nevada.updateNodeStyle(nextProps.nevadaStyleData)
      this.state.nevada.updateRelStyle(nextProps.nevadaRelData)
      this.state.nevada.updateOptions({fullscreen: nextProps.fullscreen})
    }
  }

  initialiseVis (el) {
    if (el) {
      this.state.parentContainer = el
    }
  }
  render () {
    return (<div className='nevada-canvas' ref={this.initialiseVis.bind(this)} />)
  }
}
