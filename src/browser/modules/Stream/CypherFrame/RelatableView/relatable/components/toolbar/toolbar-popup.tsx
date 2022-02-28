/*
 * Copyright (c) "Neo4j"
 * Neo4j Sweden AB [http://neo4j.com]
 * This file is part of Neo4j.
 * Neo4j is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 */
import React, { PropsWithChildren } from 'react'
import { Popup } from 'semantic-ui-react'
import styled from 'styled-components'

const StyleWrapper = styled.div`
  .relatable__toolbar-popup {
    min-width: 250px;
  }

  .relatable__toolbar-value {
    margin: 0 5px 5px 0;
  }

  .relatable__toolbar-popup .relatable__toolbar-popup-button.button {
    box-shadow: none;
  }
`

export function ToolbarPopup({
  children = null,
  content,
  name,
  selectedToolbarAction,
  ...rest
}: PropsWithChildren<any>) {
  const isOpen = selectedToolbarAction && selectedToolbarAction.name === name

  return (
    <Popup
      {...rest}
      on="click"
      open={isOpen}
      style={{ maxWidth: 'none' }}
      position="bottom left"
      trigger={children}
    >
      <StyleWrapper>{content}</StyleWrapper>
    </Popup>
  )
}
