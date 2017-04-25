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
import { StyledRowToggle, StyledCaret } from './styled'

export class RowExpandToggleComponent extends Component {

  updateDimensions () {
    let rowHeight = this.props.rowElem && this.props.rowElem.base ? this.props.rowElem.base.clientHeight : 0
    this.setState({rowHeight: rowHeight})
  }

  componentWillMount () {
    this.updateDimensions()
  }
  componentDidMount () {
    this.updateDimensions()
    window.addEventListener('resize', this.updateDimensions.bind(this))
  }
  componentWillUnmount () {
    window.removeEventListener('resize', this.updateDimensions.bind(this))
  }

  render () {
    this.state.rowHeight = this.props.rowElem ? this.props.rowElem.base.clientHeight : 0
    if (this.props.containerHeight * 1.1 < this.state.rowHeight) {
      return (
        <StyledRowToggle onClick={this.props.onClick}>
          <StyledCaret className={this.props.contracted ? 'fa fa-caret-left' : 'fa fa-caret-down'} />
        </StyledRowToggle>
      )
    } else {
      return null
    }
  }
}
