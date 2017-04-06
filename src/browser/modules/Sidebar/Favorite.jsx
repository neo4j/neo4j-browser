/*
 * Copyright (c) 2002-2016 "Neo Technology,"
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

import { connect } from 'preact-redux'
import * as favorite from 'shared/modules/favorites/favoritesDuck'
import {FavoriteItem, FavoriteList} from 'browser-components/buttons'
import { withBus } from 'preact-suber'
import { Component } from 'preact'

function extractNameFromCommand (input) {
  if (!input) {
    return ''
  }

  let firstRow = input.split('\n')[0]
  if (firstRow.indexOf('//') === 0) {
    return firstRow.substr(2).trim()
  } else {
    return input.trim()
  }
}

export class Folder extends Component {
  render () {
    return <FavoriteList {...this.props} active={this.state.active}
      onClick={() => this.setState({active: !this.state.active})} />
  }
}

export const Favorite = ({id, content, onItemClick, removeClick, isChild, isStatic}) => {
  const name = extractNameFromCommand(content)
  return (
    <FavoriteItem
      primaryText={name}
      onClick={() => onItemClick(content)}
      removeClick={() => removeClick(id)}
      isChild={isChild}
      isStatic={isStatic}
    />
  )
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    removeClick: (id) => {
      dispatch(favorite.removeFavorite(id))
    }
  }
}

export default withBus(connect(null, mapDispatchToProps)(Favorite))
