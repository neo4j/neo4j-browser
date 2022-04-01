/*
 * Copyright (c) "Neo4j"
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

import { FileDropIcon } from '../icons/LegacyIcons'

import arrayHasItems from '../../../shared/utils/array-has-items'
import {
  createLoadFavoritesPayload,
  getFolderNamesFromFavorites,
  getMissingFoldersFromNames,
  readZipFiles
} from './file-drop.utils'
import {
  StyledFileDrop,
  StyledFileDropActionButton,
  StyledFileDropActions,
  StyledFileDropContent,
  StyledFileDropInner
} from './styled'
import {
  commandSources,
  executeCommand,
  showErrorMessage
} from 'shared/modules/commands/commandsDuck'
import * as editor from 'shared/modules/editor/editorDuck'
import * as favoritesDuck from 'shared/modules/favorites/favoritesDuck'
import * as foldersDuck from 'shared/modules/favorites/foldersDuck'
import { updateGraphStyleData } from 'shared/modules/grass/grassDuck'
import { parseGrass } from 'shared/services/grassUtils'

function FileDrop(props: any) {
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

  const pasteInEditor = (content: any) => {
    props.bus && props.bus.send(editor.SET_CONTENT, editor.setContent(content))
  }

  const fileLoader = (file: any, callback: any) => {
    const reader = new FileReader()
    reader.onload = fileEvent => {
      callback((fileEvent.target as FileReader).result)
      resetState()
    }
    reader.onerror = () => {
      dispatchErrorMessage("Something wen't wrong when reading the file")
      resetState()
    }
    reader.readAsText(file)
  }

  const handleDragOver = (event: any) => {
    event.stopPropagation()
    event.preventDefault()
  }

  const handleDragEnter = (event: any) => {
    if (
      !fileHoverState &&
      event.dataTransfer.types &&
      event.dataTransfer.types.length === 1 &&
      event.dataTransfer.types[0] === 'Files'
    ) {
      setFileHoverState(true)
    }
  }

  const handleDragLeave = (event: any) => {
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

  const handleDrop = (event: any) => {
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
      readZipFiles(files).then(saveManyFavorites).then(resetState)

      return
    }

    if (extension === 'grass') {
      fileLoader(files[0], (result: any) => {
        importGrass(result)
        const action = executeCommand(':style', { source: commandSources.auto })
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
          <FileDropIcon width={190} title={'Import'} />
          {userSelect && (
            <StyledFileDropActions>
              <StyledFileDropActionButton
                className="filedrop-save-to-favorites"
                onClick={() => {
                  fileLoader(file, saveCypherToFavorites)
                }}
              >
                Save to favorites
              </StyledFileDropActionButton>
              <StyledFileDropActionButton
                className="filedrop-paste-in-editor"
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

const mapStateToProps = (state: any) => ({
  folders: foldersDuck.getFolders(state)
})
const mapDispatchToProps = (dispatch: any) => {
  return {
    saveCypherToFavorites: (file: any) => {
      dispatch(favoritesDuck.addFavorite(file))
    },
    saveManyFavorites: (favoritesToAdd: any, allFolders: any) => {
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
    importGrass: (file: any) => {
      const parsedGrass = parseGrass(file)
      if (parsedGrass) {
        dispatch(updateGraphStyleData(parsedGrass))
      } else {
        dispatch(showErrorMessage('Could not parse grass data'))
      }
    },
    dispatchErrorMessage: (message: any) => dispatch(showErrorMessage(message))
  }
}
const mergeProps = (stateProps: any, dispatchProps: any, ownProps: any) => ({
  ...stateProps,
  ...dispatchProps,
  saveManyFavorites: (favorites: any) =>
    dispatchProps.saveManyFavorites(favorites, stateProps.folders),
  ...ownProps
})

export default withBus(
  connect(mapStateToProps, mapDispatchToProps, mergeProps)(FileDrop)
)
