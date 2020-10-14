/*
 * Copyright (c) 2002-2020 "Neo4j,"
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
import { useMutation } from '@apollo/client'
import { getProjectId } from 'shared/modules/app/appDuck'

import { Drawer, DrawerHeader } from 'browser-components/drawer'
import ProjectFilesScripts, { ProjectFilesError } from './ProjectsFilesScripts'
import NewSavedScript from './NewSavedScript'
import {
  setProjectFileDefaultFileName,
  updateCacheAddProjectFile
} from './project-files.utils'
import { CYPHER_FILE_EXTENSION } from 'shared/services/export-favorites'
import { ADD_PROJECT_FILE } from './project-files.constants'
import { setDraftScript } from 'src-root/shared/modules/sidebar/sidebarDuck'

interface ProjectFiles {
  projectId: string
  scriptDraft: string
  resetDraft: () => void
}

const ProjectFiles = ({ projectId, scriptDraft, resetDraft }: ProjectFiles) => {
  const [addFile, { error: apolloError }] = useMutation(ADD_PROJECT_FILE)
  const [error, setError] = useState('')

  function save(inputedFileName: string) {
    const fileName = inputedFileName.replace(/\.cypher$/, '')
    setError('')

    if (!fileName.length) {
      setError('File name cannot be empty')
      return
    }
    if (
      fileName.includes('/') ||
      fileName.includes('\\') ||
      fileName.includes('..') ||
      fileName.startsWith('.') ||
      fileName.includes(':') // Windows
    ) {
      setError("File name cannot include /, \\, .., : or start with '.'")
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

const mapDispatchToProps = (dispatch: any) => {
  return {
    resetDraft: () => {
      dispatch(setDraftScript(null, 'project files'))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ProjectFiles)
