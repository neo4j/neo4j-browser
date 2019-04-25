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
import neo4j from 'neo4j-driver'
import {
  StyledStatsBar,
  PaddedTableViewDiv,
  StyledBodyMessage
} from '../styled'
import Ellipsis from 'browser-components/Ellipsis'
import {
  StyledTable,
  StyledBodyTr,
  StyledTh,
  StyledTd,
  StyledJsonPre
} from 'browser-components/DataTables'
import { shallowEquals, stringifyMod } from 'services/utils'
import {
  getBodyAndStatusBarMessages,
  getRecordsToDisplayInTable,
  transformResultRecordsToResultArray
} from './helpers'
import { stringFormat } from 'services/bolt/cypherTypesFormatting'

const renderCell = entry => {
  if (Array.isArray(entry)) {
    const children = entry.map((item, index) => (
      <span key={index}>
        {renderCell(item)}
        {index === entry.length - 1 ? null : ', '}
      </span>
    ))
    return <span>[{children}]</span>
  } else if (typeof entry === 'object') {
    return renderObject(entry)
  } else {
    return stringifyMod(entry, stringFormat, true)
  }
}
export const renderObject = entry => {
  if (neo4j.isInt(entry)) return entry.toString()
  if (entry === null) return <em>null</em>
  return (
    <StyledJsonPre>{stringifyMod(entry, stringFormat, true)}</StyledJsonPre>
  )
}
const buildData = entries => {
  return entries.map(entry => {
    if (entry !== null) {
      return (
        <StyledTd className='table-properties' key={v4()}>
          {renderCell(entry)}
        </StyledTd>
      )
    }
    return (
      <StyledTd className='table-properties' key={v4()}>
        null
      </StyledTd>
    )
  })
}
const buildRow = item => {
  return (
    <StyledBodyTr className='table-row' key={v4()}>
      {buildData(item)}
    </StyledBodyTr>
  )
}

export class TableView extends Component {
  state = {
    columns: [],
    data: [],
    bodyMessage: ''
  }
  componentDidMount () {
    this.makeState(this.props)
  }
  componentWillReceiveProps (props) {
    if (
      this.props === undefined ||
      this.props.result === undefined ||
      this.props.updated !== props.updated
    ) {
      this.makeState(props)
    }
  }
  shouldComponentUpdate (props, state) {
    return (
      this.props.updated !== props.updated || !shallowEquals(state, this.state)
    )
  }
  makeState (props) {
    const records = getRecordsToDisplayInTable(props.result, props.maxRows)
    const table = transformResultRecordsToResultArray(records) || []
    const data = table ? table.slice() : []
    const columns = data.length > 0 ? data.shift() : []
    const { bodyMessage } = getBodyAndStatusBarMessages(
      props.result,
      props.maxRows
    )
    this.setState({ data, columns, bodyMessage })
  }
  render () {
    if (!this.state.columns.length) {
      return (
        <PaddedTableViewDiv>
          <StyledBodyMessage>{this.state.bodyMessage}</StyledBodyMessage>
        </PaddedTableViewDiv>
      )
    }
    const tableHeader = this.state.columns.map((column, i) => (
      <StyledTh className='table-header' key={i}>
        {column}
      </StyledTh>
    ))
    const tableBody = (
      <tbody>{this.state.data.map(item => buildRow(item))}</tbody>
    )
    return (
      <PaddedTableViewDiv>
        <StyledTable>
          <thead>
            <tr>{tableHeader}</tr>
          </thead>
          {tableBody}
        </StyledTable>
      </PaddedTableViewDiv>
    )
  }
}

export class TableStatusbar extends Component {
  state = {
    statusBarMessage: ''
  }
  componentDidMount () {
    this.makeState(this.props)
  }
  componentWillReceiveProps (props) {
    this.makeState(props)
  }
  shouldComponentUpdate (props, state) {
    if (!shallowEquals(state, this.state)) return true
    return false
  }
  makeState (props) {
    const { statusBarMessage } = getBodyAndStatusBarMessages(
      props.result,
      props.maxRows
    )
    if (statusBarMessage !== undefined) this.setState({ statusBarMessage })
  }
  render () {
    return (
      <StyledStatsBar>
        <Ellipsis>{this.state.statusBarMessage}</Ellipsis>
      </StyledStatsBar>
    )
  }
}
