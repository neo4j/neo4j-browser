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

interface ProjectFiles {
  projectId: string
  scriptDraft: string
}

const ProjectFiles = ({ projectId, scriptDraft }: ProjectFiles) => {
  const [addFile, { error: apolloError }] = useMutation(ADD_PROJECT_FILE)
  const [error, setError] = useState('')

  function save(inputedFileName: string) {
    const fileName = inputedFileName.replace(/\.cypher$/, '')
    setError('')

    if (!fileName.length) {
      setError('File name cannot be empty')
      return
    }
    if (fileName.includes('/') || fileName.includes('\\')) {
      setError('File name cannot include / or \\')
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
    }).catch(e => e)
  }

  return (
    <Drawer id="db-project-files">
      <DrawerHeader>Project Files</DrawerHeader>
      <NewSavedScript
        defaultName={setProjectFileDefaultFileName(scriptDraft)}
        headerText="Save as"
        onSubmit={save}
      />
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

export default connect(mapStateToProps)(ProjectFiles)
