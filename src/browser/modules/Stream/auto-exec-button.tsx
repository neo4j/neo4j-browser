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
import React, { useCallback } from 'react'
import { withBus } from 'react-suber'
import styled from 'styled-components'

import {
  commandSources,
  executeCommand
} from '../../../shared/modules/commands/commandsDuck'

const StyledAutoExecButton = styled.button`
  border-radius: 3px;
  border: transparent;
  display: inline-block;
  font-family: 'Fira Code', 'Courier New', 'Courier', monospace, 'Monaco',
    'Courier New', Terminal, monospace;
  font-size: 12px;
  line-height: 18px;
  padding: 0 4px;
  color: #5ca6d9;
  cursor: pointer;
  text-decoration: none;
  background-color: ${props => props.theme.runnableBackground};
  outline: transparent;
`

export function AutoExecButtonComponent({
  bus,
  cmd,
  displayText,
  isCypher = false,
  ...rest
}: any) {
  const onClick = useCallback(() => {
    const action = executeCommand(isCypher ? cmd : `:${cmd}`, {
      source: commandSources.button
    })

    bus.send(action.type, action)
  }, [cmd])

  return (
    <StyledAutoExecButton type="button" onClick={onClick} {...rest}>
      <i className="fa fa-play-circle-o" />{' '}
      {displayText ?? (isCypher ? cmd : `:${cmd}`)}
    </StyledAutoExecButton>
  )
}

export default withBus(AutoExecButtonComponent)
