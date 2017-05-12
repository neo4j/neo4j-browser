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

import {connect} from 'preact-redux'
import * as favorite from 'shared/modules/favorites/favoritesDuck'
import {StyledListItem, StyledFavoriteText, DeleteFavButton, ExecFavortieButton} from './styled'
import {withBus} from 'preact-suber'
import {Component} from 'preact'
import {DragSource, DropTarget} from 'react-dnd'
import ItemTypes from './DragItemTypes'

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

const favoriteSource = {
  beginDrag (props) {
    return {
      id: props.id,
      index: props.index,
      folder: props.entry.folder,
      text: props.text
    }
  }
}

const calculateNewPosition = (props, component, monitor) => {
  const dragItem = monitor.getItem()
  const dragIndex = dragItem.index
  const hoverIndex = props.index

  if (dragIndex === hoverIndex && props.entry.folder === dragItem.folder) {
    return null
  }

  const hoverBoundingRect = component.base.getBoundingClientRect()
  const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2
  const clientOffset = monitor.getClientOffset()
  const hoverClientY = clientOffset.y - hoverBoundingRect.top

  if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
    return null
  }

  if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
    return null
  }

  return { dragIndex, dragFolder: dragItem.folder, hoverIndex, hoverFolder: props.entry.folder, dragItem, hoveredItemProps: props }
}

const favoriteTarget = {
  hover (props, monitor, component) {
    let newValues = calculateNewPosition(props, component, monitor)

    if (newValues) {
      props.moveFavorite(Object.assign({...newValues}, {dropped: false}))
      monitor.getItem().index = newValues.hoverIndex
    }
  },
  drop (props, monitor, component) {
    const dragItem = monitor.getItem()
    const dragIndex = dragItem.index
    const hoverIndex = props.index
    props.moveFavorite({ dragIndex, dragFolder: dragItem.folder, hoverIndex, hoverFolder: props.entry.folder, dragItem, hoveredItemProps: props, dropped: true })
  }
}

class FavoriteDp extends Component {
  render () {
    const name = extractNameFromCommand(this.props.content)
    let favoriteContent = (
      <StyledListItem isChild={this.props.isChild}>
        <ExecFavortieButton onClick={() => this.props.onExecClick(this.props.content)} />
        <StyledFavoriteText {...this.props}
          onClick={() => this.props.onItemClick(this.props.content)}>{name}</StyledFavoriteText>
        <DeleteFavButton id={this.props.id} removeClick={() => this.props.removeClick(this.props.id)}
          isStatic={this.props.isStatic} />
      </StyledListItem>
    )

    if (this.props.isStatic) {
      return favoriteContent
    } else {
      return this.props.connectDropTarget(<div>{favoriteContent}</div>)
    }
  }
}

class FavoriteDg extends Component {
  render () {
    if (this.props.isStatic) {
      return <FavoriteDp {...this.props} />
    } else {
      return this.props.connectDragSource(
        <div>
          <FavoriteDp {...this.props} />
        </div>
      )
    }
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    removeClick: (id) => {
      dispatch(favorite.removeFavorite(id))
    }
  }
}

const FavoriteDrop = DropTarget(ItemTypes.FAVORITE, favoriteTarget, connect => ({
  connectDropTarget: connect.dropTarget()
}))(FavoriteDg)

const FavoriteDrag = DragSource(ItemTypes.FAVORITE, favoriteSource, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging()
}))(FavoriteDrop)

export default withBus(connect(null, mapDispatchToProps)(FavoriteDrag))
