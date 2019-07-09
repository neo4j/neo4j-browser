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

import React, { useContext } from 'react'
import PropTypes from 'prop-types'
import { DndProvider } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'
import { ThemeContext } from 'styled-components'
import { map, first, last, sortBy, lowerCase } from 'lodash-es'

import { getHeaderStyleFromTheme } from './my-scripts.utils'
import { arrayHasItems } from './generic.utils'
import { useEmptyFolders, useScriptsFolders } from './my-scripts.hooks'

import MyScriptsFolder from './my-scripts-folder'
import MyScriptsNewFolderButton from './my-scripts-new-folder-button'
import MyScriptsExportButton from './my-scripts-export-button'

import './my-scripts.css'

export default function MyScripts(props) {
  const {
    title,
    isStatic,
    scriptsNamespace,
    scripts,
    onExportScripts,
    onExecScript,
    onSelectScript,
    onRemoveScript,
    onUpdateFolder,
    onRemoveFolder
  } = props

  const theme = useContext(ThemeContext) // @todo: remove coupling
  const [rootFolder, subFolders] = useScriptsFolders(scriptsNamespace, scripts)
  const allSavedFolderNames = [first(rootFolder), ...map(subFolders, first)]
  const [
    emptyFolders,
    canAddFolder,
    addEmptyFolder,
    updateEmptyFolder,
    removeEmptyFolder
  ] = useEmptyFolders(scriptsNamespace, allSavedFolderNames)
  const allFolderNames = [...allSavedFolderNames, ...emptyFolders]
  const sortedSubFolders = sortBy(subFolders, folder =>
    lowerCase(first(folder))
  )

  return (
    <div className="my-scripts">
      <DndProvider backend={HTML5Backend}>
        <div className="my-scripts__body">
          <div className="my-scripts__body-section">
            <h5
              className="my-scripts__header"
              style={getHeaderStyleFromTheme({ theme })}
            >
              {title}
              <div className="my-scripts__button-wrapper">
                {isStatic ? null : (
                  <>
                    <MyScriptsExportButton onExport={onExportScripts} />
                    <MyScriptsNewFolderButton
                      disabled={!canAddFolder}
                      onAdd={addEmptyFolder}
                    />
                  </>
                )}
              </div>
            </h5>
            <MyScriptsFolder
              isRoot
              isStatic={isStatic}
              scriptsNamespace={scriptsNamespace}
              allFolderNames={allFolderNames}
              folderName={first(rootFolder)}
              scripts={last(rootFolder)}
              onSelectScript={onSelectScript}
              onExecScript={onExecScript}
              onRemoveScript={onRemoveScript}
              onUpdateFolder={onUpdateFolder}
              onRemoveFolder={Function.prototype}
            />
            {map(sortedSubFolders, ([folderName, subScripts]) => (
              <MyScriptsFolder
                key={`my-folder-${folderName}`}
                isStatic={isStatic}
                scriptsNamespace={scriptsNamespace}
                allFolderNames={allFolderNames}
                folderName={folderName}
                scripts={subScripts}
                onSelectScript={onSelectScript}
                onExecScript={onExecScript}
                onRemoveScript={onRemoveScript}
                onUpdateFolder={onUpdateFolder}
                onRemoveFolder={onRemoveFolder}
              />
            ))}
            {map(emptyFolders, folderName => (
              <MyScriptsFolder
                key={`my-empty-folder-${folderName}`}
                isStatic={isStatic}
                scriptsNamespace={scriptsNamespace}
                allFolderNames={allFolderNames}
                folderName={folderName}
                scripts={[]}
                onSelectScript={Function.prototype}
                onExecScript={Function.prototype}
                onRemoveScript={Function.prototype}
                onUpdateFolder={(folderScripts, { path }) =>
                  arrayHasItems(folderScripts)
                    ? onUpdateFolder(folderScripts, { path })
                    : updateEmptyFolder(folderName, path)
                }
                onRemoveFolder={() => removeEmptyFolder(folderName)}
              />
            ))}
          </div>
        </div>
      </DndProvider>
    </div>
  )
}

MyScripts.propTypes = {
  title: PropTypes.string,
  scriptsNamespace: PropTypes.string.isRequired,
  scripts: PropTypes.array.isRequired,
  onSelectScript: PropTypes.func.isRequired,
  onExportScripts: PropTypes.func.isRequired,
  onExecScript: PropTypes.func.isRequired,
  onRemoveScript: PropTypes.func.isRequired,
  onUpdateFolder: PropTypes.func.isRequired,
  onRemoveFolder: PropTypes.func.isRequired
}

MyScripts.defaultProps = {
  title: 'Saved Scripts'
}
