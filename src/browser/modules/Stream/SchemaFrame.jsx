/*
 * Copyright (c) 2002-2019 "Neo4j,"
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

import React, { Component } from 'react'
import { v4 } from 'uuid'
import { withBus } from 'react-suber'
import { replace, toUpper } from 'lodash-es'

import { CYPHER_REQUEST } from 'shared/modules/cypher/cypherDuck'
import FrameTemplate from '../Frame/FrameTemplate'
import Slide from '../Carousel/Slide'
import {
  StyledTable,
  StyledTh,
  StyledBodyTr,
  StyledTd
} from 'browser-components/DataTables'
import { Directives } from 'browser-components/Directives'
import { NEO4J_BROWSER_USER_ACTION_QUERY } from 'services/bolt/txMetadata'

const formatIndexes = indexes => {
  if (indexes.length === 0) {
    return ['None']
  }

  return indexes.map(
    index =>
      `${replace(index.description, 'INDEX', '')} ${toUpper(index.state)} ${
        index.type === 'node_unique_property'
          ? '(for uniqueness constraint)'
          : ''
      }`
  )
}

const formatConstraints = constraints => {
  if (constraints.length === 0) {
    return ['None']
  }

  return constraints.map(constraint =>
    replace(constraint.description, 'CONSTRAINT', '')
  )
}

const SchemaTable = ({ name, content }) => (
  <StyledTable>
    <thead>
      <tr>
        <StyledTh className='table-header'>{name}</StyledTh>
      </tr>
    </thead>
    <tbody>
      {content.map(row => (
        <StyledBodyTr className='table-row' key={v4()}>
          <StyledTd className='table-properties'>{row}</StyledTd>
        </StyledBodyTr>
      ))}
    </tbody>
  </StyledTable>
)

export class SchemaFrame extends Component {
  constructor (props) {
    super(props)
    this.state = {
      indexes: [],
      constraints: []
    }
  }
  responseHandler (name) {
    return res => {
      if (!res.success || !res.result || !res.result.records.length) {
        this.setState({ [name]: [] })
        return
      }
      const out = res.result.records.map(rec =>
        rec.keys.reduce((acc, key) => {
          acc[key] = rec.get(key)
          return acc
        }, {})
      )
      this.setState({ [name]: out })
    }
  }
  componentDidMount () {
    if (this.props.bus) {
      // Indexes
      this.props.bus.self(
        CYPHER_REQUEST,
        {
          query: 'CALL db.indexes()',
          queryType: NEO4J_BROWSER_USER_ACTION_QUERY
        },
        this.responseHandler('indexes')
      )
      // Constraints
      this.props.bus.self(
        CYPHER_REQUEST,
        {
          query: 'CALL db.constraints()',
          queryType: NEO4J_BROWSER_USER_ACTION_QUERY
        },
        this.responseHandler('constraints')
      )
    }
    if (this.props.indexes) {
      this.responseHandler('indexes')(this.props.indexes)
    }
    if (this.props.constraints) {
      this.responseHandler('constraints')(this.props.constraints)
    }
  }

  render () {
    const indexes = formatIndexes(this.state.indexes)
    const constraints = formatConstraints(this.state.constraints)

    const frame = (
      <Slide>
        <SchemaTable name='Indexes' content={indexes} />
        <SchemaTable name='Constraints' content={constraints} />
        <br />
        <p className='lead'>Execute the following query for more information</p>
        <figure>
          <pre className='code runnable'>CALL db.schema.visualization</pre>
        </figure>
      </Slide>
    )

    return (
      <div style={{ width: '100%' }}>
        <Directives content={frame} />
      </div>
    )
  }
}

const Frame = props => {
  return (
    <FrameTemplate header={props.frame} contents={<SchemaFrame {...props} />} />
  )
}

export default withBus(Frame)
