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
import { v4 } from 'uuid'
import { PaddedDiv, StyledBodyMessage } from '../styled'
import {StyledTable, StyledBodyTr, StyledTh, StyledTd} from 'browser-components/DataTables'
import { stripQuotes } from 'shared/services/utils'

class TableView extends Component {
  constructor (props) {
    super(props)
    const dataCopy = props.data ? props.data.slice() : []
    const headerData = dataCopy.length > 0 ? dataCopy.shift() : []
    this.state = {
      columns: headerData,
      data: dataCopy
    }
  }
  render () {
    if (!this.props.data) return (<PaddedDiv style={this.props.style}><StyledBodyMessage>{this.props.message}</StyledBodyMessage></PaddedDiv>)
    const tableHeader = this.state.columns.map((column, i) => (
      <StyledTh className='table-header' key={i}>{stripQuotes(column)}</StyledTh>)
    )
    const buildData = (entries) => {
      return entries.map((entry) => {
        if (entry !== null) {
          return <StyledTd className='table-properties' key={v4()}>{entry}</StyledTd>
        }
        return <StyledTd className='table-properties' key={v4()}>(empty)</StyledTd>
      })
    }
    const buildRow = (item) => {
      return (
        <StyledBodyTr className='table-row' key={v4()}>
          {buildData(item)}
        </StyledBodyTr>
      )
    }
    const tableBody = (
      <tbody>
        {
          this.state.data.map((item) => (
            buildRow(item)
          ))
        }
      </tbody>
    )
    return (
      <PaddedDiv style={this.props.style}>
        <StyledTable>
          <thead>
            <tr>
              {tableHeader}
            </tr>
          </thead>
          {tableBody}
        </StyledTable>
      </PaddedDiv>
    )
  }
}

export default TableView
