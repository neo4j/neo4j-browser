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
import { connect } from 'preact-redux'
import { selectBookmark } from '../actions'
import { getBookmarks, getActiveBookmark } from '../reducer'

export class Dropdown extends Component {
  constructor (props) {
    super(props)
    this.state = { selected: this.props.activeBookmark }
  }
  change (event) {
    this.setState({ selected: event.target.value }, () => {
      this.props.onBookmarkChange(this.state.selected)
    })
  }
  componentWillReceiveProps (newProps) {
    this.setState({ selected: newProps.activeBookmark })
  }
  render () {
    let bms = this.props.bookmarks.map(bm => {
      return (
        <option value={bm.id} key={bm.id}>
          {bm.name}
        </option>
      )
    })
    return (
      <select onChange={this.change.bind(this)} value={this.state.selected}>
        {bms}
      </select>
    )
  }
}

const mapStateToProps = state => {
  return {
    bookmarks: getBookmarks(state),
    activeBookmark: getActiveBookmark(state)
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onBookmarkChange: id => {
      dispatch(selectBookmark(id))
    }
  }
}

const ConnectedDropdown = connect(mapStateToProps, mapDispatchToProps)(Dropdown)
export default ConnectedDropdown
