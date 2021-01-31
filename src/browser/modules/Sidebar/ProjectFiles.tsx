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
import React, { useState, Dispatch } from 'react'
import { Action } from 'redux'
import { connect } from 'react-redux'
import { useMutation } from '@apollo/client'
import { getProjectId } from 'shared/modules/app/appDuck'

import { Drawer, DrawerHeader } from 'browser-components/drawer'
import ProjectFilesScripts, {
  ProjectFilesError
} from '../../components/ProjectFiles/ProjectsFilesScripts'
import NewSavedScript from './NewSavedScript'
import {
  setProjectFileDefaultFileName,
  updateCacheAddProjectFile,
  checkFileNameInput
} from '../../components/ProjectFiles/projectFilesUtils'
import { CYPHER_FILE_EXTENSION } from 'services/exportFavorites'
import { ADD_PROJECT_FILE } from '../../components/ProjectFiles/projectFilesConstants'
import { setDraftScript } from 'shared/modules/sidebar/sidebarDuck'

interface ProjectFilesProps {
  projectId: string
  scriptDraft: string
  resetDraft: () => void
}

const ProjectFiles = ({
  projectId,
  scriptDraft,
  resetDraft
}: ProjectFilesProps) => {
  const [addFile, { error: apolloError }] = useMutation(ADD_PROJECT_FILE)
  const [error, setError] = useState('')

  function save(inputedFileName: string) {
    const cypherFileExt = new RegExp(`${CYPHER_FILE_EXTENSION}$`)
    const fileName = inputedFileName.replace(cypherFileExt, '')
    setError('')

    if (checkFileNameInput(fileName)) {
      setError(checkFileNameInput(fileName))
      return
    }

    addFile({
      variables: {
        projectId,
        fileUpload: new File(
          [scriptDraft],
          `${fileName}${CYPHER_FILE_EXTENSION}`
        ) // no destination; only saving to Project root at this point
      },
      update: (cache, result) =>
        updateCacheAddProjectFile(cache, result, projectId)
    })
      .then(resetDraft)
      .catch(e => e)
  }

  return (
    <Drawer id="db-project-files">
      <DrawerHeader>Project Files</DrawerHeader>
      {scriptDraft && (
        <NewSavedScript
          defaultName={setProjectFileDefaultFileName(scriptDraft)}
          headerText="Save as"
          onSubmit={save}
          onCancel={resetDraft}
        />
      )}
      <ProjectFilesError apolloErrors={[apolloError]} errors={[error]} />
      <ProjectFilesScripts />
    </Drawer>
  )
}

const mapStateToProps = (state: any) => {
  return {
    projectId: getProjectId(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch<Action>) => {
  return {
    resetDraft: () => {
      dispatch(setDraftScript(null, 'project files'))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ProjectFiles)
