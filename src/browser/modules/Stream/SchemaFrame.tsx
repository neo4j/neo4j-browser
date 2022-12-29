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
import { replace, toUpper } from 'lodash-es'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withBus } from 'react-suber'
import semver, { SemVer } from 'semver'
import { v4 } from 'uuid'

import Slide from '../Carousel/Slide'
import FrameBodyTemplate from '../Frame/FrameBodyTemplate'
import {
  StyledBodyTr,
  StyledTable,
  StyledTd,
  StyledTh
} from 'browser-components/DataTables'
import Directives from 'browser-components/Directives'
import { GlobalState } from 'project-root/src/shared/globalState'
import { NEO4J_BROWSER_USER_ACTION_QUERY } from 'services/bolt/txMetadata'
import { CYPHER_REQUEST } from 'shared/modules/cypher/cypherDuck'
import { getSemanticVersion } from 'shared/modules/dbMeta/dbMetaDuck'

type IndexesProps = {
  indexes: any
  neo4jVersion: SemVer | null
}
const Indexes = ({ indexes, neo4jVersion }: IndexesProps) => {
  if (
    !neo4jVersion ||
    !semver.valid(neo4jVersion) ||
    semver.satisfies(neo4jVersion, '<4.0.0-rc01')
  ) {
    const rows = indexes.map((index: any) => [
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

  const rows = indexes.map((index: any) => [
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

const Constraints = ({
  constraints,
  neo4jVersion
}: {
  constraints: any
  neo4jVersion: string
}) => {
  let rows = []
  let header = []

  if (semver.valid(neo4jVersion) && semver.satisfies(neo4jVersion, '<4.2.*')) {
    header = ['Constraints']

    rows = constraints.map((constraint: any) => [
      replace(constraint.description, 'CONSTRAINT', '')
    ])
  } else {
    header = [
      'Constraint Name',
      'Type',
      'EntityType',
      'LabelsOrTypes',
      'Properties'
    ]

    rows = constraints.map((constraint: any) => [
      constraint.name,
      constraint.type,
      constraint.entityType,
      JSON.stringify(constraint.labelsOrTypes, null, 2),
      JSON.stringify(constraint.properties, null, 2)
    ])
  }

  return (
    <SchemaTable
      testid="schemaFrameConstraintsTable"
      header={header}
      rows={rows}
    />
  )
}

const SchemaTable = ({ testid, header, rows }: any) => {
  const rowsOrNone =
    rows && rows.length
      ? rows
      : [header.map((_: any, i: any) => (i === 0 ? 'None' : ''))]

  const body = rowsOrNone.map((row: any) => (
    <StyledBodyTr className="table-row" key={v4()}>
      {row.map((cell: any) => (
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
          {header.map((cell: any) => (
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

type SchemaFrameState = any

export class SchemaFrame extends Component<any, SchemaFrameState> {
  constructor(props: { neo4jVersion: string }) {
    super(props)
    this.state = {
      indexes: [],
      constraints: []
    }
  }

  responseHandler(name: any) {
    return (res: any) => {
      if (!res.success || !res.result || !res.result.records.length) {
        this.setState({ [name]: [] })
        return
      }
      const out = res.result.records.map((rec: any) =>
        rec.keys.reduce((acc: any, key: any) => {
          acc[key] = rec.get(key)
          return acc
        }, {})
      )
      this.setState({ [name]: out })
    }
  }

  fetchData(neo4jVersion: SemVer) {
    if (this.props.bus) {
      // Indexes
      this.props.bus.self(
        CYPHER_REQUEST,
        {
          query:
            semver.valid(neo4jVersion) &&
            semver.satisfies(neo4jVersion, '<4.2.*')
              ? 'CALL db.indexes()'
              : 'SHOW INDEXES',
          queryType: NEO4J_BROWSER_USER_ACTION_QUERY
        },
        this.responseHandler('indexes')
      )
      // Constraints
      this.props.bus.self(
        CYPHER_REQUEST,
        {
          query:
            semver.valid(neo4jVersion) &&
            semver.satisfies(neo4jVersion, '<4.2.*')
              ? 'CALL db.constraints()'
              : 'SHOW CONSTRAINTS',
          queryType: NEO4J_BROWSER_USER_ACTION_QUERY
        },
        this.responseHandler('constraints')
      )
    }
  }
  componentDidMount() {
    this.fetchData(this.props.neo4jVersion)
    if (this.props.indexes) {
      this.responseHandler('indexes')(this.props.indexes)
    }
    if (this.props.constraints) {
      this.responseHandler('constraints')(this.props.constraints)
    }
  }

  componentDidUpdate(prevProps: any) {
    if (
      this.props.frame &&
      this.props.frame.schemaRequestId !== prevProps.frame.schemaRequestId
    ) {
      this.fetchData(this.props.neo4jVersion)
    }
  }

  render(): JSX.Element {
    const { neo4jVersion } = this.props
    const { indexes, constraints } = this.state
    const schemaCommand =
      semver.valid(neo4jVersion) && semver.satisfies(neo4jVersion, '<=3.4.*')
        ? 'CALL db.schema()'
        : 'CALL db.schema.visualization'

    const frame = (
      <Slide>
        <Indexes indexes={indexes} neo4jVersion={neo4jVersion} />
        <Constraints constraints={constraints} neo4jVersion={neo4jVersion} />
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

const Frame = (props: any) => {
  return (
    <FrameBodyTemplate
      isCollapsed={props.isCollapsed}
      isFullscreen={props.isFullscreen}
      contents={<SchemaFrame {...props} />}
    />
  )
}

const mapStateToProps = (state: GlobalState) => ({
  neo4jVersion: getSemanticVersion(state)
})

export default withBus(connect(mapStateToProps, null)(Frame))
