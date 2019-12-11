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
import { StyledRowToggle, StyledCaret } from './styled'

const getHeightFromElem = rowElem =>
  rowElem && rowElem ? rowElem.clientHeight : 0

export class RowExpandToggleComponent extends Component {
  state = {}
  updateDimensions = () => {
    this.setState({ rowHeight: getHeightFromElem(this.props.rowElem) })
  }

  componentDidMount() {
    this.updateDimensions()
    window.addEventListener('resize', this.updateDimensions)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateDimensions)
  }

  componentDidUpdate(prevProps, prevState) {
    const rowHeight = getHeightFromElem(this.props.rowElem)
    if (this.state.rowHeight !== rowHeight) {
      this.updateDimensions()
    }
  }

  render() {
    if (this.props.containerHeight * 1.1 < this.state.rowHeight) {
      return (
        <StyledRowToggle onClick={this.props.onClick}>
          <StyledCaret
            className={
              this.props.contracted ? 'fa fa-caret-left' : 'fa fa-caret-down'
            }
          />
        </StyledRowToggle>
      )
    } else {
      return null
    }
  }
}
