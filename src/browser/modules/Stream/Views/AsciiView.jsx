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
import asciitable from 'ascii-data-table'
import { debounce } from 'services/utils'
import { StyledStatsBar, PaddedDiv, StyledBodyMessage, StyledRightPartial, StyledWidthSliderContainer, StyledWidthSlider } from '../styled'

const AsciiView = ({rows, style, message, maxColWidth = 70}) => {
  let contents = <StyledBodyMessage>{message}</StyledBodyMessage>
  if (rows !== undefined && rows.length) {
    contents = <pre>{asciitable.tableFromSerializedData(rows, maxColWidth)}</pre>
  }
  return <PaddedDiv style={style}>{contents}</PaddedDiv>
}

export class AsciiStatusbar extends Component {
  constructor (props) {
    super(props)
    this.state = {
      maxSliderWidth: 140,
      maxColWidth: 70
    }
  }
  componentWillReceiveProps (nextProps) {
    this.ensureContentWidth(nextProps.rows)
  }
  ensureContentWidth (rows) {
    if (rows.length !== this.props.rows.length) {
      this.setMaxSliderWidth(asciitable.maxColumnWidth(rows))
    }
  }
  componentWillMount () {
    this.debouncedMaxColWidthChanged = debounce(this.maxColWidthChanged, 25, this)
    this.setMaxSliderWidth(asciitable.maxColumnWidth(this.props.rows))
  }
  maxColWidthChanged (w) {
    this.setState({ maxColWidth: w.target.value })
    this.props.onInput(w.target.value)
  }
  setMaxSliderWidth (w) {
    this.setState({ maxSliderWidth: w })
  }
  render () {
    const { maxColWidth, maxSliderWidth } = this.state
    const onInput = this.debouncedMaxColWidthChanged
    return (
      <StyledStatsBar>
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
      </StyledStatsBar>
    )
  }
}

export default AsciiView
