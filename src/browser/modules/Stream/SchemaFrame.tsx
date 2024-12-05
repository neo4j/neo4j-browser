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
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import semver from 'semver'
import { v4 } from 'uuid'

import Slide from '../Carousel/Slide'
import { NEO4J_BROWSER_USER_ACTION_QUERY } from 'services/bolt/txMetadata'
import { executeCommand } from 'shared/modules/commands/commandsDuck'
import { getSemanticVersion } from 'shared/modules/dbMeta/dbMetaDuck'
import FrameBodyTemplate from '../Frame/FrameBodyTemplate'
import { upperFirst, toKeyString } from 'shared/utils/stringUtils'

const NEO4J_4_0 = '4.0.0'
const NEO4J_4_2 = '4.2.0'
const NEO4J_5_0 = '5.0.0'

interface Index {
  name: string
  type: string
  uniqueness: string
  entityType: string
  labelsOrTypes: string[]
  properties: string[]
  state: string
  description: string
}

interface Constraint {
  name: string
  type: string
  entityType: string
  labelsOrTypes: string[]
  properties: string[]
  description: string
}

interface SchemaTableProps {
  testid: string
  header: string[]
  rows: string[][]
}

const SchemaTable = ({ testid, header, rows }: SchemaTableProps) => {
  const rowsOrNone = rows?.length 
    ? rows 
    : [header.map((_, i) => (i === 0 ? 'None' : ''))]

  return (
    <div className="overflow-x-auto">
      <table className="w-full" data-testid={testid}>
        <thead>
          <tr className="bg-surface-secondary dark:bg-surface-secondary-dark">
            {header.map(cell => (
              <th key={v4()} className="p-2 text-left font-medium">
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rowsOrNone.map(row => (
            <tr key={v4()} className="border-b border-border dark:border-border-dark">
              {row.map(cell => (
                <td key={v4()} className="p-2">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

interface IndexesProps {
  indexes: Index[]
  neo4jVersion: string | null
}

const Indexes = ({ indexes, neo4jVersion }: IndexesProps) => {
  if (!neo4jVersion || !semver.valid(neo4jVersion)) return null

  // Legacy format for Neo4j < 4.0
  if (semver.satisfies(neo4jVersion, `<${NEO4J_4_0}`)) {
    const rows = indexes.map(index => [
      `${replace(index.description, 'INDEX', '')} ${toUpper(index.state)} ${
        index.type === 'node_unique_property' ? '(for uniqueness constraint)' : ''
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

  // Modern format for Neo4j 4.0+
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

interface ConstraintsProps {
  constraints: Constraint[]
  neo4jVersion: string
}

const Constraints = ({ constraints, neo4jVersion }: ConstraintsProps) => {
  if (!semver.valid(neo4jVersion)) return null

  // Legacy format for Neo4j < 4.2
  if (semver.satisfies(neo4jVersion, `<${NEO4J_4_2}`)) {
    return (
      <SchemaTable
        testid="schemaFrameConstraintsTable"
        header={['Constraints']}
        rows={constraints.map(constraint => [
          replace(constraint.description, 'CONSTRAINT', '')
        ])}
      />
    )
  }

  // Modern format for Neo4j 4.2+
  const header = [
    'Constraint Name',
    'Type',
    'EntityType',
    'LabelsOrTypes',
    'Properties'
  ]

  const rows = constraints.map(constraint => [
    constraint.name,
    constraint.type,
    constraint.entityType,
    JSON.stringify(constraint.labelsOrTypes, null, 2),
    JSON.stringify(constraint.properties, null, 2)
  ])

  return (
    <SchemaTable
      testid="schemaFrameConstraintsTable"
      header={header}
      rows={rows}
    />
  )
}

interface SchemaFrameProps {
  frame?: {
    schemaRequestId?: string
    useDb?: string
  }
  isFullscreen?: boolean
  isCollapsed?: boolean
}

interface CommandResponse {
  success: boolean
  result?: {
    records: Array<{
      keys: string[]
      get: (key: string) => any
    }>
  }
}

// Update executeCommand options type
interface CommandOptions {
  id?: string | number
  requestId?: string
  parentId?: string
  useDb?: string | null
  isRerun?: boolean
  source?: string
  onSuccess?: (response: CommandResponse) => void
}

export function SchemaFrame({ 
  frame, 
  isFullscreen = false,
  isCollapsed = false,
}: SchemaFrameProps) {
  const dispatch = useDispatch()
  const neo4jVersion = useSelector(getSemanticVersion)
  const [indexes, setIndexes] = useState<Index[]>([])
  const [constraints, setConstraints] = useState<Constraint[]>([])

  const responseHandler = (name: 'indexes' | 'constraints') => (res: CommandResponse) => {
    if (!res.success || !res.result?.records?.length) {
      name === 'indexes' ? setIndexes([]) : setConstraints([])
      return
    }
    const records = res.result.records.map(rec =>
      rec.keys.reduce((acc: any, key: string) => {
        acc[key] = rec.get(key)
        return acc
      }, {})
    )
    name === 'indexes' ? setIndexes(records) : setConstraints(records)
  }

  const fetchData = async () => {
    if (!neo4jVersion) return

    // Get indexes
    const indexQuery = semver.satisfies(String(neo4jVersion), `<${NEO4J_4_2}`)
      ? 'CALL db.indexes()'
      : 'SHOW INDEXES'

    dispatch(executeCommand(indexQuery, {
      source: NEO4J_BROWSER_USER_ACTION_QUERY,
      useDb: frame?.useDb,
      onSuccess: responseHandler('indexes')
    } as CommandOptions))

    // Get constraints  
    const constraintQuery = semver.satisfies(String(neo4jVersion), `<${NEO4J_4_2}`)
      ? 'CALL db.constraints()'
      : 'SHOW CONSTRAINTS'

    dispatch(executeCommand(constraintQuery, {
      source: NEO4J_BROWSER_USER_ACTION_QUERY,
      useDb: frame?.useDb,
      onSuccess: responseHandler('constraints')
    } as CommandOptions))
  }

  useEffect(() => {
    fetchData()
  }, [neo4jVersion, frame?.useDb])

  useEffect(() => {
    if (frame?.schemaRequestId) {
      fetchData()
    }
  }, [frame?.schemaRequestId])

  const schemaCommand = neo4jVersion && semver.valid(String(neo4jVersion)) && 
    semver.satisfies(String(neo4jVersion), `>=${NEO4J_5_0}`)
      ? 'SHOW DATABASE GRAPH'
      : 'CALL db.schema.visualization'

  const content = (
    <Slide>
      <Indexes indexes={indexes} neo4jVersion={neo4jVersion ? String(neo4jVersion) : null} />
      <Constraints constraints={constraints} neo4jVersion={String(neo4jVersion || '')} />
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
    <FrameBodyTemplate
      isCollapsed={isCollapsed}
      isFullscreen={isFullscreen}
      contents={
        <div className="p-4 space-y-4">
          <Indexes indexes={indexes} neo4jVersion={neo4jVersion ? String(neo4jVersion) : null} />
          <Constraints constraints={constraints} neo4jVersion={String(neo4jVersion || '')} />
          <div className="mt-6">
            <p className="text-lg font-medium mb-2">
              Execute the following command to visualize what's related, and how
            </p>
            <pre className="bg-surface-secondary dark:bg-surface-secondary-dark p-4 rounded-md font-mono">
              {schemaCommand}
            </pre>
          </div>
        </div>
      }
    />
  )
}

export default SchemaFrame
