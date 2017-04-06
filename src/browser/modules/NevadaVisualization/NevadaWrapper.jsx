/*
 * Copyright (c) 2002-2016 "Neo Technology,"
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

export class NevadaWrapper extends Component {
  constructor (props) {
    super(props)
    this.state = {}
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

  componentWillUnmount () {
    if (this.state.nevada) {
      this.state.nevada.destroy()
    }
  }

  fetchLabels () {
    return this.props.labels
  }

  labelsUpdated (labels) {
    return this.props.onLabelsSave(labels)
  }

  componentDidMount () {
    if (this.state.parentContainer) {
      const callbacks = {
        getNeighbours: this.getNeighbours.bind(this),
        labelsUpdated: this.labelsUpdated.bind(this),
        fetchLabels: this.fetchLabels.bind(this)
      }
      require.ensure([], (require) => {
        const Nevada = require('neo4j-visualization').default
        this.state.nevada = new Nevada(this.state.parentContainer, this.props.nodes, this.props.relationships, {}, callbacks)
      }, 'nevada')
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
