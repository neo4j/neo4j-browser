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

/* global btoa */
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withBus } from 'react-suber'
import * as editor from 'shared/modules/editor/editorDuck'
import * as favorite from 'shared/modules/favorites/favoritesDuck'
import * as folder from 'shared/modules/favorites/foldersDuck'
import { getSettings } from 'shared/modules/settings/settingsDuck'
import { executeCommand } from 'shared/modules/commands/commandsDuck'

import Render from 'browser-components/Render'
import Favorite from './Favorite'
import Folder from './Folder'
import FileDrop from './FileDrop'
import {
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerSection,
  DrawerSubHeader
} from 'browser-components/drawer'
import { DragDropContext } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'
import { NewFolderButton } from './styled'

const mapFavorites = (favorites, props, isChild, moveAction) => {
  return favorites.map((entry, index) => {
    return (
      <Favorite
        entry={entry}
        key={`${btoa(entry.name + entry.content + entry.id)}`}
        id={entry.id}
        name={entry.name}
        content={entry.content}
        onItemClick={props.onItemClick}
        onExecClick={props.onExecClick}
        removeClick={props.removeClick}
        isChild={isChild}
        isStatic={entry.isStatic}
        index={index}
        moveFavorite={moveAction}
      />
    )
  })
}

class Favorites extends Component {
  constructor (props) {
    super(props)
    this.state = { ...this.props }
  }

  componentWillReceiveProps (nextProps) {
    this.setState({
      favorites: nextProps.favorites,
      folders: nextProps.folders
    })
  }

  moveFavorite = dragDropValues => {
    const { dropped } = dragDropValues
    let newFavorites = this.arrangeFavoriteList(dragDropValues)

    if (dropped) {
      this.props.updateFavorites(newFavorites)
    } else {
      this.setState({ favorites: newFavorites })
    }
  }

  arrangeFavoriteList ({
    dragIndex,
    dragFolder,
    hoverIndex,
    hoverFolder,
    dragItem,
    hoveredItemProps
  }) {
    let newFavorites

    if (dragFolder === hoverFolder || (!dragFolder && !hoverFolder)) {
      let favorites = this.state.favorites
      let draggedFav = favorites.find(fav => fav.id === dragItem.id)
      let draggedFavIndex = favorites.findIndex(fav => fav.id === dragItem.id)
      let newIndex = draggedFavIndex + (hoverIndex - dragIndex)
      favorites.splice(draggedFavIndex, 1)
      newFavorites = favorites
        .slice(0, newIndex)
        .concat([draggedFav])
        .concat(favorites.slice(newIndex))
    } else {
      let favorites = this.state.favorites
      let draggedFav = favorites.find(fav => fav.id === dragItem.id)
      let draggedFavIndex = favorites.findIndex(fav => fav.id === dragItem.id)
      let hoveredFavIndex = favorites.findIndex(
        fav => fav.id === hoveredItemProps.id
      )
      let newIndex = hoveredFavIndex
      favorites.splice(draggedFavIndex, 1)
      draggedFav.folder = hoverFolder
      newFavorites = favorites
        .slice(0, newIndex)
        .concat([draggedFav])
        .concat(favorites.slice(newIndex))
    }

    return newFavorites
  }

  moveToFolder = (folder, draggedItem, dropped) => {
    let draggedFav = this.state.favorites.find(fav => fav.id === draggedItem.id)
    draggedFav.folder = folder.id

    if (dropped) {
      this.props.updateFavorites(this.state.favorites)
    } else {
      this.setState({ favorites: this.state.favorites })
    }
  }

  updateFolder = (folderName, folderId) => {
    let folder = this.state.folders.find(fold => fold.id === folderId)
    folder.name = folderName
    this.props.updateFolders(this.state.folders)
  }

  render () {
    const { favorites, folders } = { ...this.state }

    const ListOfFavorites = mapFavorites(
      favorites.filter(fav => !fav.isStatic && !fav.folder),
      this.props,
      false,
      this.moveFavorite
    )
    const ListOfFolders = folders
      .filter(folder => !folder.isStatic)
      .map(folder => {
        const Favorites = mapFavorites(
          favorites.filter(fav => !fav.isStatic && fav.folder === folder.id),
          this.props,
          true,
          this.moveFavorite
        )
        return (
          <Folder
            key={folder.id}
            folder={folder}
            removeClick={this.props.removeFolderClick}
            moveToFolder={this.moveToFolder}
            updateFolder={this.updateFolder}
          >
            {Favorites}
          </Folder>
        )
      })
    const ListOfSampleFolders = folders
      .filter(folder => folder.isStatic)
      .map(folder => {
        const Favorites = mapFavorites(
          favorites.filter(fav => fav.isStatic && fav.folder === folder.id),
          this.props,
          true,
          this.moveFavorite
        )
        return (
          <Folder key={folder.id} folder={folder}>
            {Favorites}
          </Folder>
        )
      })

    return (
      <Drawer id='db-favorites'>
        <DrawerHeader>Favorites</DrawerHeader>
        <DrawerBody>
          <DrawerSection>
            <DrawerSubHeader>
              Saved Scripts
              <NewFolderButton onClick={() => this.props.addFolderClick()} />
            </DrawerSubHeader>
            {ListOfFavorites}
            {ListOfFolders}
          </DrawerSection>
          <Render if={this.props.showSampleScripts}>
            <DrawerSection>
              <DrawerSubHeader>Sample Scripts</DrawerSubHeader>
              {ListOfSampleFolders}
            </DrawerSection>
          </Render>
          <DrawerSection>
            <DrawerSubHeader>Import</DrawerSubHeader>
            <FileDrop />
          </DrawerSection>
        </DrawerBody>
      </Drawer>
    )
  }
}

const mapStateToProps = state => {
  return {
    favorites: state.documents || [],
    folders: state.folders || [],
    showSampleScripts: getSettings(state).showSampleScripts
  }
}
const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onItemClick: (id, cmd) => {
      ownProps.bus.send(editor.EDIT_CONTENT, editor.editContent(id, cmd))
    },
    onExecClick: cmd => {
      const action = executeCommand(cmd)
      ownProps.bus.send(action.type, action)
    },
    removeClick: id => {
      const action = favorite.removeFavorite(id)
      dispatch(action)
    },
    addFolderClick: () => {
      const action = folder.addFolder()
      dispatch(action)
    },
    removeFolderClick: id => {
      const action = folder.removeFolder(id)
      dispatch(action)
    },
    updateFavorites: favorites => {
      const action = favorite.updateFavorites(favorites)
      dispatch(action)
    },
    updateFolders: folders => {
      const action = folder.updateFolders(folders)
      dispatch(action)
    }
  }
}
export default DragDropContext(HTML5Backend)(
  withBus(connect(mapStateToProps, mapDispatchToProps)(Favorites))
)
