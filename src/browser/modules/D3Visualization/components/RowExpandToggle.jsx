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
import { StyledRowToggle, StyledCaret } from './styled'

const getHeightFromElem = rowElem =>
  rowElem && rowElem.base ? rowElem.base.clientHeight : 0

export class RowExpandToggleComponent extends Component {
  updateDimensions () {
    this.setState({ rowHeight: getHeightFromElem(this.props.rowElem) })
  }

  componentDidMount () {
    this.updateDimensions()
    window.addEventListener('resize', this.updateDimensions.bind(this))
  }
  componentWillUnmount () {
    window.removeEventListener('resize', this.updateDimensions.bind(this))
  }

  componentDidUpdate (prevProps, prevState) {
    const rowHeight = getHeightFromElem(this.props.rowElem)
    if (this.state.rowHeight !== rowHeight) {
      this.updateDimensions()
    }
  }

  render () {
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
