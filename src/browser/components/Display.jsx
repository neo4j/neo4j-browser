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
import { shallowEquals } from 'services/utils'

export default class Display extends Component {
  constructor (props) {
    super(props)
    this.state = {
      displayed: false,
      mounted: false
    }
  }
  componentDidMount () {
    if (this.props.if === true) {
      this.setState({ displayed: true, mounted: true })
    }
  }
  componentWillReceiveProps (props) {
    if (props.if && this.state.displayed === false) {
      this.setState({ displayed: true, mounted: true })
      return
    }
    if (!props.if && this.state.displayed === true) {
      this.setState({ displayed: false })
    }
  }
  shouldComponentUpdate (props, state) {
    if (props.if === false && this.props.if === false) return false // Never rerender non displayed components
    return !(
      shallowEquals(props, this.props) && shallowEquals(state, this.state)
    )
  }
  render () {
    if (!this.state.displayed && !this.state.mounted && this.props.lazy) {
      return null
    } // Lazy load it
    const { style = {}, children = [] } = this.props
    const modStyle = {
      ...style,
      width: 'inherit',
      display: !this.state.displayed
        ? 'none'
        : this.props.inline
          ? 'inline'
          : 'block'
    }
    return <div style={modStyle}>{children}</div>
  }
}
