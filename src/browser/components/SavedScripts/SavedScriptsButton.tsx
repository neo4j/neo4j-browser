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
import React, { ReactEventHandler } from 'react'
import { Icon, SemanticICONS } from 'semantic-ui-react'
import { SemanticCOLORS } from 'semantic-ui-react/dist/commonjs/generic'
import { StyledSavedScriptsButton } from './styled'

type SavedScriptsButtonProps = {
  onClick: ReactEventHandler
  title: string
  iconName: SemanticICONS
  color?: SemanticCOLORS
}

export default function SavedScriptsButton({
  onClick,
  title,
  iconName,
  color
}: SavedScriptsButtonProps): JSX.Element {
  return (
    <StyledSavedScriptsButton
      className="saved-scripts__button"
      title={title}
      data-testid={`savedScriptsButton-${title}`}
      onClick={onClick}
    >
      <Icon color={color} name={iconName} />
    </StyledSavedScriptsButton>
  )
}

type OnClickProp = { onClick: ReactEventHandler }
const ExportButton = ({ onClick }: OnClickProp): JSX.Element =>
  SavedScriptsButton({ onClick, title: 'Export', iconName: 'download' })

const EditButton = ({ onClick }: OnClickProp): JSX.Element =>
  SavedScriptsButton({ onClick, title: 'Edit', iconName: 'pencil' })

const RunButton = ({ onClick }: OnClickProp): JSX.Element =>
  SavedScriptsButton({ onClick, title: 'Run', iconName: 'play' })

const NewFolderButton = ({ onClick }: OnClickProp): JSX.Element =>
  SavedScriptsButton({
    onClick,
    title: 'New folder',
    iconName: 'folder open outline'
  })

const RemoveButton = ({ onClick }: OnClickProp): JSX.Element =>
  SavedScriptsButton({
    onClick,
    title: 'Remove',
    iconName: 'trash alternate outline'
  })

const RedRemoveButton = ({ onClick }: OnClickProp): JSX.Element =>
  SavedScriptsButton({
    onClick,
    title: 'Remove',
    iconName: 'trash alternate outline',
    color: 'red'
  })

export {
  SavedScriptsButton,
  ExportButton,
  EditButton,
  RunButton,
  NewFolderButton,
  RemoveButton,
  RedRemoveButton
}
