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

import React, { Component } from 'react'
import asciitable from 'ascii-data-table'
import Render from 'browser-components/Render'
import Ellipsis from 'browser-components/Ellipsis'
import { shallowEquals, deepEquals } from 'services/utils'
import {
  StyledStatsBar,
  PaddedDiv,
  StyledBodyMessage,
  StyledRightPartial,
  StyledWidthSliderContainer,
  StyledWidthSlider
} from '../styled'
import {
  getBodyAndStatusBarMessages,
  getRecordsToDisplayInTable,
  transformResultRecordsToResultArray,
  stringifyResultArray
} from './helpers'
import { stringFormat } from 'services/bolt/cypherTypesFormatting'

export class AsciiView extends Component {
  constructor (props) {
    super(props)
    this.state = {
      serializedRows: [],
      bodyMessage: ''
    }
  }
  componentDidMount () {
    this.makeState(this.props)
  }
  componentWillReceiveProps (props) {
    if (!this.equalProps(props)) {
      this.makeState(props)
    }
  }
  equalProps (props) {
    if (
      this.props !== undefined &&
      this.props.result !== undefined &&
      deepEquals(props.result.records, this.props.result.records) &&
      props.maxRows === this.props.maxRows &&
      props._asciiMaxColWidth === this.props._asciiMaxColWidth
    ) {
      return true
    }
    return false
  }

  shouldComponentUpdate (props, state) {
    return !this.equalProps(props) || !shallowEquals(state, this.state)
  }
  makeState (props) {
    const { result, maxRows } = props
    const { bodyMessage = null } =
      getBodyAndStatusBarMessages(result, maxRows) || {}
    this.setState({ bodyMessage })
    if (!result || !result.records) return
    const records = getRecordsToDisplayInTable(props.result, props.maxRows)
    const serializedRows =
      stringifyResultArray(
        stringFormat,
        transformResultRecordsToResultArray(records)
      ) || []
    this.setState({ serializedRows })
    this.props.setParentState &&
      this.props.setParentState({ _asciiSerializedRows: serializedRows })
  }
  render () {
    const { _asciiMaxColWidth: maxColWidth = 70 } = this.props
    const { serializedRows, bodyMessage } = this.state
    let contents = <StyledBodyMessage>{bodyMessage}</StyledBodyMessage>
    if (serializedRows !== undefined && serializedRows.length) {
      contents = (
        <pre>
          {asciitable.tableFromSerializedData(serializedRows, maxColWidth)}
        </pre>
      )
    }
    return <PaddedDiv>{contents}</PaddedDiv>
  }
}

export class AsciiStatusbar extends Component {
  constructor (props) {
    super(props)
    this.state = {
      maxSliderWidth: 140,
      maxColWidth: 70,
      statusBarMessage: ''
    }
  }
  componentWillReceiveProps (props) {
    if (
      !deepEquals(props._asciiSerializedRows, this.props._asciiSerializedRows)
    ) {
      this.makeState(props)
    }
  }
  makeState (props) {
    this.setMaxSliderWidth(
      asciitable.maxColumnWidth(props._asciiSerializedRows)
    )
    const { statusBarMessage = null } =
      getBodyAndStatusBarMessages(props.result, props.maxRows) || {}
    this.setState({ statusBarMessage })
  }
  shouldComponentUpdate (props, state) {
    if (
      !deepEquals(props._asciiSerializedRows, this.props._asciiSerializedRows)
    ) {
      return true
    }
    if (!shallowEquals(state, this.state)) return true
    return false
  }
  componentDidMount () {
    this.makeState(this.props)
  }
  maxColWidthChanged = w => {
    const value = w.target.value
    this.setState({ maxColWidth: value })
    this.props.setParentState({ _asciiMaxColWidth: value })
  }
  setMaxSliderWidth (w) {
    this.setState({ maxSliderWidth: w })
  }
  render () {
    const { maxColWidth, maxSliderWidth } = this.state
    const onInput = this.maxColWidthChanged
    return (
      <StyledStatsBar>
        <Render if={!this.props._asciiSerializedRows}>
          <Ellipsis>{this.state.statusBarMessage}</Ellipsis>
        </Render>
        <Render if={this.props._asciiSerializedRows}>
          <StyledRightPartial>
            <StyledWidthSliderContainer>
              Max column width:
              <StyledWidthSlider
                value={maxColWidth}
                onChange={onInput}
                type='range'
                min='3'
                max={maxSliderWidth}
              />
            </StyledWidthSliderContainer>
          </StyledRightPartial>
        </Render>
      </StyledStatsBar>
    )
  }
}
