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

import React, { PureComponent } from 'react'

export default class Display extends PureComponent {
  state = {
    mounted: false
  }

  componentDidMount() {
    if (this.props.if) {
      this.setState({ mounted: true })
    }
  }

  componentWillReceiveProps(props) {
    if (this.state.mounted === false && props.if) {
      this.setState({ mounted: true })
    }
  }

  render() {
    // If lazy, don't load anything until it's time
    if (!this.props.if && !this.state.mounted && this.props.lazy) {
      return null
    }
    const { style = {}, children = [] } = this.props
    const modStyle = {
      ...style,
      width: 'inherit',
      display: !this.props.if ? 'none' : this.props.inline ? 'inline' : 'block'
    }
    return <div style={modStyle}>{children}</div>
  }
}
