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

import {
  FoldersButton,
  StyledList,
  StyledListHeaderItem,
  DeleteFavButton,
  EditFolderButton,
  FolderButtonContainer,
  EditFolderInput
} from './styled'
import { Component } from 'preact'
import {
  CollapseMenuIcon,
  ExpandMenuIcon
} from 'browser-components/icons/Icons'
import { DropTarget } from 'react-dnd'
import Render from 'browser-components/Render'
import ItemTypes from './DragItemTypes'

class Folder extends Component {
  constructor (props) {
    super(props)
    this.state = { ...props }
  }

  onFolderNameChanged (e) {
    this.props.updateFolder(e.target.value, this.props.folder.id)
  }

  folderNameInputSet (el) {
    if (el) {
      this.folderNameInput = el
      this.folderNameInput.onkeypress = this.handleKeyPress.bind(this)
    }
  }

  handleKeyPress (e) {
    if (e.keyCode === 13) {
      this.setState({ editing: false })
    }
  }

  componentDidUpdate () {
    this.folderNameInput && this.folderNameInput.focus()
  }

  render () {
    let icon = this.state.active ? <CollapseMenuIcon /> : <ExpandMenuIcon />
    let folderContents = (
      <div>
        <StyledList>
          <StyledListHeaderItem>
            <Render if={!this.state.editing}>
              <span
                onClick={() => this.setState({ active: !this.state.active })}
              >
                {this.props.folder.name}
              </span>
            </Render>
            <Render if={this.state.editing}>
              <EditFolderInput
                type='text'
                onChange={this.onFolderNameChanged.bind(this)}
                onBlur={() => this.setState({ editing: false })}
                value={this.props.folder.name}
                innerRef={this.folderNameInputSet.bind(this)}
              />
            </Render>
            <FolderButtonContainer>
              <FoldersButton
                onClick={() => this.setState({ active: !this.state.active })}
              >
                {icon}
              </FoldersButton>
              <Render if={!this.props.folder.isStatic}>
                <EditFolderButton
                  editClick={() => {
                    this.setState({ editing: true })
                    return false
                  }}
                />
              </Render>&nbsp;
              <DeleteFavButton
                id={this.props.folder.id}
                removeClick={this.props.removeClick}
                isStatic={this.props.folder.isStatic}
              />
            </FolderButtonContainer>
          </StyledListHeaderItem>
          {this.state.active ? this.props.children : null}
        </StyledList>
      </div>
    )

    if (this.props.children && this.props.children.length > 0) {
      return folderContents
    } else {
      return this.props.connectDropTarget(folderContents)
    }
  }
}

const folderTarget = {
  hover (props, monitor, component) {
    const dragItem = monitor.getItem()
    props.moveToFolder(props.folder, dragItem, false)
  },
  drop (props, monitor, component) {
    const dragItem = monitor.getItem()
    props.moveToFolder(props.folder, dragItem, true)
  }
}

export default DropTarget(ItemTypes.FAVORITE, folderTarget, connect => ({
  connectDropTarget: connect.dropTarget()
}))(Folder)
