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
import { withBus } from 'preact-suber'
import { CYPHER_REQUEST } from 'shared/modules/cypher/cypherDuck'
import FrameTemplate from '../Stream/FrameTemplate'
import Visible from 'browser-components/Visible'

export class SchemaFrame extends Component {
  constructor (props) {
    super(props)
    this.state = {
      indexes: [],
      constraints: []
    }
  }
  responseHandler (name) {
    return (res) => {
      if (!res.success || !res.result || !res.result.records.length) {
        this.setState({ [name]: [] })
        return
      }
      const out = res.result.records.map((rec) => rec.get('description'))
      this.setState({ [name]: out })
    }
  }
  componentDidMount () {
    if (this.props.bus) {
      // Indexes
      this.props.bus.self(
        CYPHER_REQUEST,
        {
          query: 'CALL db.indexes()'
        },
        this.responseHandler('indexes')
      )
      // Contraints
      this.props.bus.self(
        CYPHER_REQUEST,
        {
          query: 'CALL db.constraints()'
        },
        this.responseHandler('constraints')
      )
    }
  }
  render () {
    const indexes = this.state.indexes.map((index, i) => {
      return <div key={i}>{index}</div>
    })
    const constraints = this.state.constraints.map((con, i) => {
      return <div key={i}>{con}</div>
    })
    const schema = (
      <div>
        <h3>Indexes</h3>
        <Visible if={this.state.indexes.length}><div>{indexes}</div></Visible>
        <Visible if={!this.state.indexes.length}>
          <span>No indexes</span>
        </Visible>
        <br />
        <h3>Constraints</h3>
        <Visible if={this.state.constraints.length}><div>{constraints}</div></Visible>
        <Visible if={!this.state.constraints.length}>
          <span>No constraints</span>
        </Visible>
      </div>
    )
    return (
      <FrameTemplate
        header={this.props.frame}
        contents={schema}
      />
    )
  }
}
export default withBus(SchemaFrame)
