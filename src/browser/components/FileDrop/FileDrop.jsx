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

import React, { useState } from 'react'
import { connect } from 'react-redux'
import { withBus } from 'react-suber'
import SVGInline from 'react-svg-inline'

import * as editor from 'shared/modules/editor/editorDuck'
import * as favoritesDuck from 'shared/modules/favorites/favoritesDuck'
import * as foldersDuck from 'shared/modules/favorites/foldersDuck'
import { parseGrass } from 'shared/services/grassUtils'
import { updateGraphStyleData } from 'shared/modules/grass/grassDuck'
import {
  showErrorMessage,
  executeCommand
} from 'shared/modules/commands/commandsDuck'
import {
  createLoadFavoritesPayload,
  getFolderNamesFromFavorites,
  getMissingFoldersFromNames,
  readZipFiles
} from './file-drop.utils'

import {
  StyledFileDrop,
  StyledFileDropInner,
  StyledFileDropContent,
  StyledFileDropActions,
  StyledFileDropActionButton
} from './styled'
import icon from 'icons/task-list-download.svg'
import arrayHasItems from '../../../shared/utils/array-has-items'

export function FileDrop (props) {
  const [fileHoverState, setFileHoverState] = useState(false)
  const [userSelect, setUserSelect] = useState(false)
  const [file, setFile] = useState(null)
  const {
    saveCypherToFavorites,
    saveManyFavorites,
    importGrass,
    dispatchErrorMessage
  } = props

  const resetState = () => {
    setFileHoverState(false)
    setUserSelect(false)
    setFile(null)
  }

  const pasteInEditor = content => {
    props.bus && props.bus.send(editor.SET_CONTENT, editor.setContent(content))
  }

  const fileLoader = (file, callback) => {
    const reader = new FileReader()
    reader.onload = fileEvent => {
      callback(fileEvent.target.result)
      resetState()
    }
    reader.onerror = () => {
      dispatchErrorMessage(`Something wen't wrong when reading the file`)
      resetState()
    }
    reader.readAsText(file)
  }

  const handleDragOver = event => {
    event.stopPropagation()
    event.preventDefault()
  }

  const handleDragEnter = event => {
    if (
      !fileHoverState &&
      event.dataTransfer.types &&
      event.dataTransfer.types.length === 1 &&
      event.dataTransfer.types[0] === 'Files'
    ) {
      setFileHoverState(true)
    }
  }

  const handleDragLeave = event => {
    // Check if we're leaving the browser window
    if (
      event.clientX <= 0 ||
      event.clientY <= 0 ||
      window.innerHeight < event.clientY ||
      window.innerWidth < event.clientX
    ) {
      resetState()
    }
  }

  const handleDrop = event => {
    const files = event.dataTransfer.files

    if (files.length !== 1) {
      resetState()
      return
    }

    event.stopPropagation()
    event.preventDefault()

    setFile(files[0])

    const extension = ((files[0] || {}).name || '').split('.').pop()

    if (['cyp', 'cypher', 'cql', 'txt'].includes(extension)) {
      setUserSelect(true)

      return
    }

    if (extension === 'zip') {
      readZipFiles(files)
        .then(saveManyFavorites)
        .then(resetState)

      return
    }

    if (extension === 'grass') {
      fileLoader(files[0], result => {
        importGrass(result)
        const action = executeCommand(':style')
        props.bus.send(action.type, action)
      })

      return
    }

    dispatchErrorMessage(`'.${extension}' is not a valid file extension`)
    resetState()
  }

  const className = ['filedrop']
  if (fileHoverState) {
    className.push('has-file-hovering')
  }

  if (userSelect) {
    className.push('has-user-select')
  }

  return (
    <StyledFileDrop
      className={className.join(' ')}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {props.children}
      <StyledFileDropInner onClick={resetState}>
        <StyledFileDropContent>
          <SVGInline svg={icon} accessibilityLabel={'Import'} width={'14rem'} />
          {userSelect && (
            <StyledFileDropActions>
              <StyledFileDropActionButton
                className='filedrop-save-to-favorites'
                onClick={() => {
                  fileLoader(file, saveCypherToFavorites)
                }}
              >
                Save to favorites
              </StyledFileDropActionButton>
              <StyledFileDropActionButton
                className='filedrop-paste-in-editor'
                onClick={() => {
                  fileLoader(file, pasteInEditor)
                }}
              >
                Paste in editor
              </StyledFileDropActionButton>
            </StyledFileDropActions>
          )}
        </StyledFileDropContent>
      </StyledFileDropInner>
    </StyledFileDrop>
  )
}

const mapStateToProps = state => ({
  folders: foldersDuck.getFolders(state)
})
const mapDispatchToProps = dispatch => {
  return {
    saveCypherToFavorites: file => {
      dispatch(favoritesDuck.addFavorite(file))
    },
    saveManyFavorites: (favoritesToAdd, allFolders) => {
      const folderNames = getFolderNamesFromFavorites(favoritesToAdd)
      const missingFolders = getMissingFoldersFromNames(folderNames, allFolders)
      const allFoldersIncludingMissing = [...allFolders, ...missingFolders]

      if (arrayHasItems(missingFolders)) {
        dispatch(foldersDuck.loadFolders(allFoldersIncludingMissing))
      }

      dispatch(
        favoritesDuck.loadFavorites(
          createLoadFavoritesPayload(favoritesToAdd, allFoldersIncludingMissing)
        )
      )
    },
    importGrass: file => {
      const parsedGrass = parseGrass(file)
      if (parsedGrass) {
        dispatch(updateGraphStyleData(parsedGrass))
      } else {
        dispatch(showErrorMessage('Could not parse grass data'))
      }
    },
    dispatchErrorMessage: message => dispatch(showErrorMessage(message))
  }
}
const mergeProps = (stateProps, dispatchProps, ownProps) => ({
  ...stateProps,
  ...dispatchProps,
  saveManyFavorites: favorites =>
    dispatchProps.saveManyFavorites(favorites, stateProps.folders),
  ...ownProps
})

export default withBus(
  connect(
    mapStateToProps,
    mapDispatchToProps,
    mergeProps
  )(FileDrop)
)
