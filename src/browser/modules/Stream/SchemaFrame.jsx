/*
 * Copyright (c) 2002-2018 "Neo4j, Inc"
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
import { StyledSchemaBody } from './styled'

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
          query: 'CALL db.indexes()'
        },
        this.responseHandler('indexes')
      )
      // Constraints
      this.props.bus.self(
        CYPHER_REQUEST,
        {
          query: 'CALL db.constraints()'
        },
        this.responseHandler('constraints')
      )
    }
  }

  formatIndexAndConstraints (indexes, constraints) {
    let indexString
    let constraintsString

    if (indexes.length === 0) {
      indexString = 'No indexes'
    } else {
      indexString = 'Indexes'
      indexString += indexes.reduce((acc, index) => {
        acc += `\n  ${index.description.replace(
          'INDEX',
          ''
        )} ${index.state.toUpperCase()} ${index.type === 'node_unique_property'
          ? ' (for uniqueness constraint)'
          : ''}`
        return acc
      }, '')
    }

    if (constraints.length === 0) {
      constraintsString = 'No constraints'
    } else {
      constraintsString = 'Constraints'
      constraintsString += constraints.reduce((acc, constraint) => {
        acc += `\n  ${constraint.description.replace('CONSTRAINT', '')}`
        return acc
      }, '')
    }

    return `${indexString}\n\n${constraintsString}\n`
  }

  render () {
    const contents = (
      <StyledSchemaBody>
        {this.formatIndexAndConstraints(
          this.state.indexes,
          this.state.constraints
        )}
      </StyledSchemaBody>
    )

    return <FrameTemplate header={this.props.frame} contents={contents} />
  }
}
export default withBus(SchemaFrame)
