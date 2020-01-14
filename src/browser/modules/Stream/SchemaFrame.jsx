/*
 * Copyright (c) 2002-2020 "Neo4j,"
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
import { connect } from 'react-redux'
import { withBus } from 'react-suber'
import { replace, toUpper } from 'lodash-es'
import semver from 'semver'

import { getVersion } from 'shared/modules/dbMeta/dbMetaDuck'
import { CYPHER_REQUEST } from 'shared/modules/cypher/cypherDuck'
import FrameTemplate from '../Frame/FrameTemplate'
import Slide from '../Carousel/Slide'
import {
  StyledTable,
  StyledTh,
  StyledBodyTr,
  StyledTd
} from 'browser-components/DataTables'
import Directives from 'browser-components/Directives'
import { NEO4J_BROWSER_USER_ACTION_QUERY } from 'services/bolt/txMetadata'

const Indexes = ({ indexes, neo4jVersion }) => {
  if (
    !semver.valid(neo4jVersion) ||
    semver.satisfies(neo4jVersion, '<4.0.0-rc01')
  ) {
    const rows = indexes.map(index => [
      `${replace(index.description, 'INDEX', '')} ${toUpper(index.state)} ${
        index.type === 'node_unique_property'
          ? '(for uniqueness constraint)'
          : ''
      }`
    ])

    return (
      <SchemaTable
        testid="schemaFrameIndexesTable"
        header={['Indexes']}
        rows={rows}
      />
    )
  }

  const rows = indexes.map(index => [
    index.name,
    index.type,
    index.uniqueness,
    index.entityType,
    JSON.stringify(index.labelsOrTypes, null, 2),
    JSON.stringify(index.properties, null, 2),
    index.state
  ])

  const header = [
    'Index Name',
    'Type',
    'Uniqueness',
    'EntityType',
    'LabelsOrTypes',
    'Properties',
    'State'
  ]

  return (
    <SchemaTable testid="schemaFrameIndexesTable" header={header} rows={rows} />
  )
}

const Constraints = ({ constraints }) => {
  const rows = constraints.map(constraint => [
    replace(constraint.description, 'CONSTRAINT', '')
  ])

  return (
    <SchemaTable
      testid="schemaFrameConstraintsTable"
      header={['Constraints']}
      rows={rows}
    />
  )
}

const SchemaTable = ({ testid, header, rows }) => {
  const rowsOrNone =
    rows && rows.length ? rows : [header.map((_, i) => (i === 0 ? 'None' : ''))]

  const body = rowsOrNone.map(row => (
    <StyledBodyTr className="table-row" key={v4()}>
      {row.map(cell => (
        <StyledTd className="table-properties" key={v4()}>
          {cell}
        </StyledTd>
      ))}
    </StyledBodyTr>
  ))

  return (
    <StyledTable data-testid={testid}>
      <thead>
        <tr>
          {header.map(cell => (
            <StyledTh className="table-header" key={v4()}>
              {cell}
            </StyledTh>
          ))}
        </tr>
      </thead>
      <tbody>{body}</tbody>
    </StyledTable>
  )
}

export class SchemaFrame extends Component {
  constructor(props) {
    super(props)
    this.state = {
      indexes: [],
      constraints: []
    }
  }

  responseHandler(name) {
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

  fetchData() {
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
  }
  componentDidMount() {
    this.fetchData()
    if (this.props.indexes) {
      this.responseHandler('indexes')(this.props.indexes)
    }
    if (this.props.constraints) {
      this.responseHandler('constraints')(this.props.constraints)
    }
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.frame &&
      this.props.frame.schemaRequestId !== prevProps.frame.schemaRequestId
    ) {
      this.fetchData()
    }
  }

  render() {
    const { neo4jVersion } = this.props
    const { indexes, constraints } = this.state
    const schemaCommand =
      semver.valid(neo4jVersion) && semver.satisfies(neo4jVersion, '<=3.4.*')
        ? 'CALL db.schema()'
        : 'CALL db.schema.visualization'

    const frame = (
      <Slide>
        <Indexes indexes={indexes} neo4jVersion={neo4jVersion} />
        <Constraints constraints={constraints} />
        <br />
        <p className="lead">
          Execute the following command to visualize what's related, and how
        </p>
        <figure>
          <pre className="code runnable">{schemaCommand}</pre>
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

const mapStateToProps = state => ({
  neo4jVersion: getVersion(state)
})

export default withBus(
  connect(
    mapStateToProps,
    null
  )(Frame)
)
