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
import asciitable from 'ascii-data-table'
import React, { Component } from 'react'
import { connect } from 'react-redux'

import { WarningMessage } from 'neo4j-arc/common'

import {
  PaddedDiv,
  StyledAsciiPre,
  StyledBodyMessage,
  StyledRightPartial,
  StyledStatsBar,
  StyledWidthSlider,
  StyledWidthSliderContainer
} from '../styled'
import {
  getBodyAndStatusBarMessages,
  getRecordsToDisplayInTable,
  recordToStringArray,
  resultHasTruncatedFields
} from './helpers'
import Ellipsis from 'browser-components/Ellipsis'
import { shallowEquals } from 'services/utils'
import { GlobalState } from 'shared/globalState'
import { BrowserRequestResult } from 'shared/modules/requests/requestsDuck'
import { getMaxFieldItems } from 'shared/modules/settings/settingsDuck'

interface BaseAsciiViewComponentProps {
  result: BrowserRequestResult
  updated?: number
  maxRows: number
  asciiSetColWidth?: string
  setAsciiMaxColWidth: { (asciiMaxColWidth: number): void }
}
interface AsciiViewComponentProps extends BaseAsciiViewComponentProps {
  maxFieldItems: number
}

interface AsciiViewComponentState {
  serializedRows: string[][]
  bodyMessage: string | null
}

export class AsciiViewComponent extends Component<
  AsciiViewComponentProps,
  AsciiViewComponentState
> {
  state: AsciiViewComponentState = {
    serializedRows: [],
    bodyMessage: ''
  }

  componentDidMount(): void {
    this.makeState(this.props)
  }

  componentDidUpdate(prevProps: AsciiViewComponentProps): void {
    if (!this.equalProps(prevProps)) {
      this.makeState(this.props)
    }
  }

  equalProps(props: AsciiViewComponentProps): boolean {
    if (
      this.props !== undefined &&
      this.props.result !== undefined &&
      this.props.updated === props.updated &&
      props.maxRows === this.props.maxRows &&
      props.asciiSetColWidth === this.props.asciiSetColWidth
    ) {
      return true
    }
    return false
  }

  shouldComponentUpdate(
    props: AsciiViewComponentProps,
    state: AsciiViewComponentState
  ): boolean {
    return !this.equalProps(props) || !shallowEquals(state, this.state)
  }

  makeState(props: AsciiViewComponentProps): void {
    const { result, maxRows, maxFieldItems } = props
    const { bodyMessage = null } =
      getBodyAndStatusBarMessages(result, maxRows) || {}
    this.setState({ bodyMessage })

    const hasRecords = result && 'records' in result && result.records.length
    if (!hasRecords) return

    const records = getRecordsToDisplayInTable(result, maxRows)

    if (records.length === 0) {
      const serializedRows: string[][] = []
      this.setState({ serializedRows })
      const maxColWidth = asciitable.maxColumnWidth([])
      this.props.setAsciiMaxColWidth(maxColWidth)
      return
    }

    const cypherString = records.slice(0, maxFieldItems).map(record => {
      return recordToStringArray(record)
    })
    const serializedRows: string[][] = []
    if (cypherString.length > 0) {
      serializedRows.push(records[0].keys as string[])
      serializedRows.push(...cypherString)
    } else {
      serializedRows.push([])
    }
    this.setState({ serializedRows })
    const maxColWidth = asciitable.maxColumnWidth(serializedRows)

    this.props.setAsciiMaxColWidth(maxColWidth)
  }

  /**
   * Replaces newline characters, with a double \\ to escape newline in render
   */
  removeNewlines(serializedRows: string[][]): string[][] {
    return serializedRows.map(row => {
      return row.map(value => value.replace('\n', '\\n'))
    })
  }

  render(): JSX.Element {
    const { asciiSetColWidth: maxColWidth = 70 } = this.props
    const { serializedRows, bodyMessage } = this.state
    let contents = <StyledBodyMessage>{bodyMessage}</StyledBodyMessage>
    if (
      serializedRows !== undefined &&
      serializedRows.length &&
      serializedRows[0].length
    ) {
      const stripedRows = this.removeNewlines(serializedRows)
      contents = (
        <StyledAsciiPre>
          {asciitable.tableFromSerializedData(stripedRows, maxColWidth)}
        </StyledAsciiPre>
      )
    }
    return <PaddedDiv>{contents}</PaddedDiv>
  }
}

export const AsciiView = connect((state: GlobalState) => ({
  maxFieldItems: getMaxFieldItems(state)
}))(AsciiViewComponent)

interface BaseAsciiStatusbarComponentProps {
  asciiMaxColWidth?: number
  asciiSetColWidth?: string
  maxRows: number
  result: BrowserRequestResult
  setAsciiSetColWidth: { (asciiSetColWidth: string): void }
  updated?: number
}

interface AsciiStatusbarComponentProps
  extends BaseAsciiStatusbarComponentProps {
  maxFieldItems: number
}
interface AsciiStatusbarComponentState {
  maxSliderWidth: number
  minSliderWidth: number
  maxColWidth: number | string
  statusBarMessage: string | null
  hasTruncatedFields: boolean
}

export class AsciiStatusbarComponent extends Component<
  AsciiStatusbarComponentProps,
  AsciiStatusbarComponentState
> {
  state: AsciiStatusbarComponentState = {
    maxSliderWidth: 140,
    minSliderWidth: 3,
    maxColWidth: 70,
    statusBarMessage: '',
    hasTruncatedFields: false
  }

  componentDidUpdate(): void {
    this.makeState(this.props)
  }

  makeState(props: AsciiStatusbarComponentProps): void {
    this.setMaxSliderWidth(props.asciiMaxColWidth)
    const { statusBarMessage = null } =
      getBodyAndStatusBarMessages(props.result, props.maxRows) || {}
    const hasTruncatedFields = resultHasTruncatedFields(
      props.result,
      props.maxFieldItems
    )
    this.setState({ statusBarMessage, hasTruncatedFields })
  }

  shouldComponentUpdate(
    props: AsciiStatusbarComponentProps,
    state: AsciiStatusbarComponentState
  ): boolean {
    return (
      state.maxColWidth !== this.state.maxColWidth ||
      state.maxSliderWidth !== this.state.maxSliderWidth ||
      props.updated !== this.props.updated ||
      props.asciiMaxColWidth !== this.props.asciiMaxColWidth ||
      props.asciiSetColWidth !== this.props.asciiSetColWidth
    )
  }

  componentDidMount(): void {
    this.makeState(this.props)
  }

  setColWidthChanged = (w: React.ChangeEvent<HTMLInputElement>): void => {
    const value = w.target.value
    this.setState({ maxColWidth: value })
    this.props.setAsciiSetColWidth(value)
  }

  setMaxSliderWidth(w?: number): void {
    this.setState({ maxSliderWidth: w || this.state.minSliderWidth })
  }

  render(): JSX.Element {
    const { result } = this.props
    const hasRecords = result && 'records' in result && result.records.length
    const { maxColWidth, maxSliderWidth, hasTruncatedFields } = this.state
    return (
      <StyledStatsBar>
        {!hasRecords ? (
          <Ellipsis>{this.state.statusBarMessage}</Ellipsis>
        ) : (
          <>
            {hasTruncatedFields && (
              <WarningMessage text={'Record fields have been truncated.'} />
            )}
            <StyledRightPartial>
              <StyledWidthSliderContainer>
                Max column width:
                <StyledWidthSlider
                  value={maxColWidth}
                  onChange={this.setColWidthChanged}
                  type="range"
                  min={this.state.minSliderWidth}
                  max={maxSliderWidth}
                />
              </StyledWidthSliderContainer>
            </StyledRightPartial>
          </>
        )}
      </StyledStatsBar>
    )
  }
}

export const AsciiStatusbar = connect((state: GlobalState) => ({
  maxFieldItems: getMaxFieldItems(state)
}))(AsciiStatusbarComponent)
