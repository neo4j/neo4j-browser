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

import React from 'react'

import { ActionButtonSection } from './styled'
import { EditorButton } from 'browser-components/buttons'
import ProjectFilesButton from './ProjectFilesButton'

interface ActionButtonProps {
  buttons: ActionButton[]
  width?: number
  editorValue: () => string
  isRelateAvailable: boolean
}

interface ActionButton {
  onClick: () => void
  disabled: boolean
  title: string
  icon: string
  iconColor?: string
}

const ActionButtons = ({
  buttons,
  width = 24,
  editorValue,
  isRelateAvailable
}: ActionButtonProps): JSX.Element => (
  <ActionButtonSection>
    {isRelateAvailable && (
      <ProjectFilesButton width={width} editorValue={editorValue} />
    )}
    {buttons.map((btn: ActionButton) => (
      <EditorButton
        data-testid={`editor-${btn.title.split(' ')[0]}`}
        onClick={btn.onClick}
        disabled={btn.disabled}
        title={btn.title}
        icon={btn.icon}
        key={`editor${btn.title}`}
        color={btn.iconColor}
        width={width}
      />
    ))}
  </ActionButtonSection>
)

export default ActionButtons
