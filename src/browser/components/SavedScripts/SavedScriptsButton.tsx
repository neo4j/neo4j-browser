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

import {
  DownloadIcon,
  TrashIcon,
  NewFolderIcon,
  HollowPlayIcon
} from '../icons/LegacyIcons'

import { StyledSavedScriptsButton } from './styled'
import { primaryLightColor } from 'browser-styles/themes'

type OnClickProp = { onClick: ReactEventHandler }

const ExportButton = ({ onClick }: OnClickProp): JSX.Element => (
  <StyledSavedScriptsButton
    title="Export"
    data-testid={'savedScriptsButton-Export'}
    onClick={onClick}
  >
    <DownloadIcon />
  </StyledSavedScriptsButton>
)

const RunButton = ({ onClick }: OnClickProp): JSX.Element => (
  <StyledSavedScriptsButton
    title="Run"
    data-testid={'savedScriptsButton-Run'}
    onClick={onClick}
    color={primaryLightColor}
  >
    <HollowPlayIcon title={'Run'} width={20} />
  </StyledSavedScriptsButton>
)
const NewFolderButton = ({ onClick }: OnClickProp): JSX.Element => (
  <StyledSavedScriptsButton
    title="New folder"
    data-testid={'savedScriptsButton-New folder'}
    onClick={onClick}
  >
    <NewFolderIcon title={'New folder'} width={15} />
  </StyledSavedScriptsButton>
)

const RemoveButton = ({ onClick }: OnClickProp): JSX.Element =>
  DeleteButton({ onClick, title: 'Remove' })

const RedRemoveButton = ({ onClick }: OnClickProp): JSX.Element =>
  DeleteButton({ onClick, title: 'Remove', color: '#ff6769' })

type DeleteButtonProps = {
  onClick: ReactEventHandler
  title: string
  color?: string
}
function DeleteButton({
  onClick,
  title,
  color
}: DeleteButtonProps): JSX.Element {
  return (
    <StyledSavedScriptsButton
      title={title}
      data-testid={`savedScriptsButton-${title}`}
      onClick={onClick}
      color={color}
    >
      <TrashIcon fontSize={'14px'} />
    </StyledSavedScriptsButton>
  )
}

export {
  ExportButton,
  RunButton,
  NewFolderButton,
  RemoveButton,
  RedRemoveButton
}
