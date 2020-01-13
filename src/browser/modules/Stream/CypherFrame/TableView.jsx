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
import neo4j from 'neo4j-driver'
import { HTMLEntities } from 'services/santize.utils'

import {
  StyledStatsBar,
  PaddedTableViewDiv,
  StyledBodyMessage,
  StyledTruncatedMessage
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
  transformResultRecordsToResultArray,
  resultHasTruncatedFields
} from './helpers'
import { stringModifier } from 'services/bolt/cypherTypesFormatting'
import ClickableUrls, {
  convertUrlsToHrefTags
} from '../../../components/clickable-urls'
import { getMaxFieldItems } from 'shared/modules/settings/settingsDuck'
import { connect } from 'react-redux'
import { Icon } from 'semantic-ui-react'

const renderCell = (entry, maxFieldItems) => {
  if (Array.isArray(entry)) {
    const entryToUse = maxFieldItems ? entry.slice(0, maxFieldItems) : entry
    const children = entryToUse.map((item, index) => (
      <span key={index}>
        {renderCell(item)}
        {index === entry.length - 1 ? null : ', '}
      </span>
    ))
    return <span>[{children}]</span>
  } else if (typeof entry === 'object') {
    return renderObject(entry)
  } else {
    return <ClickableUrls text={stringifyMod(entry, stringModifier, true)} />
  }
}
export const renderObject = entry => {
  if (neo4j.isInt(entry)) return entry.toString()
  if (entry === null) return <em>null</em>
  return (
    <StyledJsonPre
      dangerouslySetInnerHTML={{
        __html: convertUrlsToHrefTags(
          HTMLEntities(stringifyMod(entry, stringModifier, true))
        )
      }}
    />
  )
}
const buildData = (entries, maxFieldItems) => {
  return entries.map(entry => {
    if (entry !== null) {
      return (
        <StyledTd className="table-properties" key={v4()}>
          {renderCell(entry, maxFieldItems)}
        </StyledTd>
      )
    }
    return (
      <StyledTd className="table-properties" key={v4()}>
        null
      </StyledTd>
    )
  })
}
const buildRow = (item, maxFieldItems) => {
  return (
    <StyledBodyTr className="table-row" key={v4()}>
      {buildData(item, maxFieldItems)}
    </StyledBodyTr>
  )
}

export class TableViewComponent extends Component {
  state = {
    columns: [],
    data: [],
    bodyMessage: ''
  }

  componentDidMount() {
    this.makeState()
  }

  componentDidUpdate(prevProps) {
    if (
      this.props === undefined ||
      this.props.result === undefined ||
      this.props.updated !== prevProps.updated
    ) {
      this.makeState()
    }
  }

  shouldComponentUpdate(props, state) {
    return (
      this.props.updated !== props.updated || !shallowEquals(state, this.state)
    )
  }

  makeState() {
    const records = getRecordsToDisplayInTable(
      this.props.result,
      this.props.maxRows
    )
    const table = transformResultRecordsToResultArray(records) || []
    const data = table ? table.slice() : []
    const columns = data.length > 0 ? data.shift() : []
    const { bodyMessage } = getBodyAndStatusBarMessages(
      this.props.result,
      this.props.maxRows
    )
    this.setState({ data, columns, bodyMessage })
  }

  render() {
    if (!this.state.columns.length) {
      return (
        <PaddedTableViewDiv>
          <StyledBodyMessage>{this.state.bodyMessage}</StyledBodyMessage>
        </PaddedTableViewDiv>
      )
    }
    const tableHeader = this.state.columns.map((column, i) => (
      <StyledTh className="table-header" key={i}>
        {column}
      </StyledTh>
    ))
    const tableBody = (
      <tbody>
        {this.state.data.map(item => buildRow(item, this.props.maxFieldItems))}
      </tbody>
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

export const TableView = connect(state => ({
  maxFieldItems: getMaxFieldItems(state)
}))(TableViewComponent)

export class TableStatusbarComponent extends Component {
  state = {
    statusBarMessage: ''
  }

  componentDidMount() {
    this.makeState()
  }

  componentDidUpdate() {
    this.makeState()
  }

  shouldComponentUpdate(props, state) {
    if (!shallowEquals(state, this.state)) return true
    return false
  }

  makeState() {
    const { statusBarMessage } = getBodyAndStatusBarMessages(
      this.props.result,
      this.props.maxRows
    )
    const hasTruncatedFields = resultHasTruncatedFields(
      props.result,
      props.maxFieldItems
    )
    if (statusBarMessage !== undefined) {
      this.setState({ statusBarMessage, hasTruncatedFields })
    }
  }

  render() {
    return (
      <StyledStatsBar>
        <Ellipsis>
          {this.state.hasTruncatedFields && (
            <StyledTruncatedMessage>
              <Icon name="warning sign" /> Result fields have been
              truncated.&nbsp;
            </StyledTruncatedMessage>
          )}
          {this.state.statusBarMessage}
        </Ellipsis>
      </StyledStatsBar>
    )
  }
}

export const TableStatusbar = connect(state => ({
  maxFieldItems: getMaxFieldItems(state)
}))(TableStatusbarComponent)
