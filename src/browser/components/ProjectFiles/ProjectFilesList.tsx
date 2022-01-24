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
import React from 'react'

import { SavedScriptsBody, SavedScriptsHeader } from '../SavedScripts/styled'
import ProjectFilesListItem from './ProjectFilesListItem'

export type ProjectFileScript = {
  content: Promise<string>
  filename: string
}

interface ProjectFileListProps {
  scripts: ProjectFileScript[]
  selectScript: (script: ProjectFileScript) => void
  removeScript: (script: ProjectFileScript) => void
  execScript: (cmd: string) => void
}

export default function ProjectFileList({
  scripts,
  selectScript,
  removeScript,
  execScript
}: ProjectFileListProps): JSX.Element {
  const sortedScripts = scripts.sort((f1, f2) =>
    f1.filename.localeCompare(f2.filename)
  )

  return (
    <SavedScriptsBody>
      <SavedScriptsHeader>Cypher files</SavedScriptsHeader>
      {sortedScripts.map(script => (
        <ProjectFilesListItem
          selectScript={selectScript}
          execScript={execScript}
          removeScript={removeScript}
          script={script}
          key={script.filename}
        />
      ))}
    </SavedScriptsBody>
  )
}
