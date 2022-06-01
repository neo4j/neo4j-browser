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
import { useMutation } from '@apollo/client'
import React from 'react'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'

import ProjectFilesScripts, {
  ProjectFilesError
} from '../../components/ProjectFiles/ProjectsFilesScripts'
import { ADD_PROJECT_FILE } from '../../components/ProjectFiles/projectFilesConstants'
import {
  getProjectFileDefaultFileName,
  updateCacheAddProjectFile
} from '../../components/ProjectFiles/projectFilesUtils'
import NewSavedScript from './NewSavedScript'
import { Drawer, DrawerHeader } from 'browser-components/drawer/drawer-styled'
import { CYPHER_FILE_EXTENSION } from 'services/exporting/favoriteUtils'
import { getProjectId } from 'shared/modules/app/appDuck'
import {
  SetDraftScriptAction,
  setDraftScript
} from 'shared/modules/sidebar/sidebarDuck'
import { GlobalState } from 'shared/globalState'

interface ProjectFilesProps {
  projectId: string | undefined
  scriptDraft: string
  resetDraft: () => void
}

const ProjectFiles = ({
  projectId,
  scriptDraft,
  resetDraft
}: ProjectFilesProps) => {
  const [addFile, { error: apolloError }] = useMutation(ADD_PROJECT_FILE)

  function save(inputedFileName: string) {
    if (projectId) {
      const cypherFileExt = new RegExp(`${CYPHER_FILE_EXTENSION}$`)
      const fileName = inputedFileName.replace(cypherFileExt, '')

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
  }

  return (
    <Drawer id="db-project-files">
      <DrawerHeader>Project Files</DrawerHeader>
      {scriptDraft && (
        <NewSavedScript
          defaultName={getProjectFileDefaultFileName(scriptDraft)}
          headerText="Save as"
          onSubmit={save}
          onCancel={resetDraft}
          pattern="^[\w\-.$+]+$"
          patternMessage="Include only letters, numbers or . - _ $ +"
        />
      )}
      <ProjectFilesError apolloErrors={[apolloError]} />
      <ProjectFilesScripts />
    </Drawer>
  )
}

const mapStateToProps = (state: GlobalState) => ({
  projectId: getProjectId(state)
})

const mapDispatchToProps = (dispatch: Dispatch<SetDraftScriptAction>) => ({
  resetDraft: () => {
    dispatch(setDraftScript(null, 'project files'))
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(ProjectFiles)
