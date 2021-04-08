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

import { DownloadIcon } from 'browser-components/icons/Icons'
import React from 'react'
import { DropdownItem } from 'semantic-ui-react'
import { Frame } from 'shared/modules/stream/streamDuck'
import {
  DropdownButton,
  DropdownContent,
  DropDownItemDivider,
  DropdownList
} from './styled'

type ExportButtonProps = {
  frame: Frame
  isRelateAvailable: boolean
  newProjectFile: (name: string) => void
  exportItems?: ExportItem[]
}

export type ExportItem = { name: string; download: () => void }

export default function ExportButton({
  frame,
  isRelateAvailable,
  newProjectFile,
  exportItems = []
}: ExportButtonProps): JSX.Element | null {
  const canExport: boolean = exportItems.length > 0 || isRelateAvailable

  return canExport ? (
    <DropdownButton data-testid="frame-export-dropdown">
      <DownloadIcon />
      <DropdownList>
        <DropdownContent>
          {isRelateAvailable && (
            <>
              <DropdownItem onClick={() => newProjectFile(frame.cmd)}>
                Save as project file
              </DropdownItem>
              <DropDownItemDivider />
            </>
          )}

          {exportItems.map(({ name, download }) => (
            <DropdownItem
              data-testid={`export${name}Button`}
              onClick={download}
              key={name}
            >
              Export {name}
            </DropdownItem>
          ))}
        </DropdownContent>
      </DropdownList>
    </DropdownButton>
  ) : null
}
